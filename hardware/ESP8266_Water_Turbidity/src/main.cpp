#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h> // เพิ่ม Library สำหรับรองรับลิงก์ HTTPS
#include <WiFiManager.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// กำหนด Address ของจอ LCD (ส่วนใหญ่จะเป็น 0x27 หรือ 0x3F)
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ==========================================
// การตั้งค่า API และ Server
// ==========================================
// ใส่ IP เครื่องคอมพิวเตอร์ของคุณ หรือ URL เว็บจริง
const char* serverName = "https://water-village.vercel.app/api/water";

// ==========================================
// การตั้งค่าฮาร์ดแวร์
// ==========================================
const int sensorPin = A0;      
const int ledGreenPin = D1;    // ไฟเขียว (สถานะ: ต่อ Wi-Fi บ้านสำเร็จแล้ว)
const int ledRedPin = D2;      // ไฟแดง (สถานะ: ยังไม่ต่อเน็ต / รอตั้งค่า)

const float TURBIDITY_THRESHOLD = 5.0; 

unsigned long previousMillisLCD = 0;
const long lcdInterval = 500; // อัปเดตหน้าจอ LCD ทุกๆ 0.5 วินาที (Real-time มาก)

unsigned long previousMillisAPI = 0;
const long apiInterval = 5000; // ส่งข้อมูลขึ้นเว็บคลาวด์ทุกๆ 5 วินาที

// ==========================================
// การตั้งค่า Wi-Fi
// ==========================================
// จะใช้ WiFiManager ในการจัดการผ่านหน้าเว็บของบอร์ด

void setup() {
  Serial.begin(115200);
  
  // ตั้งค่า I2C Pins: D3(SDA) และ D4(SCL)
  Wire.begin(D3, D4);
  
  // เริ่มการทำงานของจอ LCD
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("Booting...");
  
  pinMode(ledGreenPin, OUTPUT);
  pinMode(ledRedPin, OUTPUT);
  
  // เริ่มต้นมา ไฟแดงติด (แสดงว่ายังไม่ได้ต่อเน็ต)
  digitalWrite(ledRedPin, HIGH);
  digitalWrite(ledGreenPin, LOW);

  // สร้างตัวจัดการ Wi-Fi
  WiFiManager wifiManager;
  
  // ตั้งเวลาให้หน้าเว็บตั้งค่า Wi-Fi ทำงานแค่ 15 วินาที
  // ถ้าไม่มีใครมาตั้งค่า หรือต่อเน็ตไม่ได้ ให้ทะลุไปทำงานแบบ "ออฟไลน์" ทันที
  wifiManager.setConfigPortalTimeout(15); 

  Serial.println("\nConnecting to WiFi or Starting Access Point...");
  
  // ถ้าต่อ Wi-Fi เดิมไม่ได้ มันจะปล่อย Wi-Fi ตัวเองออกมาชื่อ "Water_Sensor_Setup" ไม่มีรหัสผ่าน
  if (!wifiManager.autoConnect("Water_Sensor_Setup")) {
    Serial.println("Failed to connect within 15 seconds. Running in OFFLINE mode.");
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Timeout!");
    lcd.setCursor(0, 1);
    lcd.print("Offline Mode");
    delay(2000); // โชว์ข้อความ 2 วินาทีแล้วไปต่อ
  } else {
    // ถ้าต่อ Wi-Fi สำเร็จ
    Serial.println("\nConnected to Home WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Connected!");
    lcd.setCursor(0, 1);
    lcd.print("IP:");
    lcd.print(WiFi.localIP());
    
    // เปลี่ยนไฟเป็นสีเขียว
    digitalWrite(ledGreenPin, HIGH);
    digitalWrite(ledRedPin, LOW);
    delay(2000);
  }
}

void loop() {
  unsigned long currentMillis = millis();
  
  // เช็คสถานะ Wi-Fi ตลอดเวลา
  if(WiFi.status() == WL_CONNECTED) {
    digitalWrite(ledGreenPin, HIGH);
    digitalWrite(ledRedPin, LOW);
  } else {
    // ถ้าจู่ๆ Wi-Fi หลุด ให้กลับไปติดไฟแดง
    digitalWrite(ledGreenPin, LOW);
    digitalWrite(ledRedPin, HIGH);
  }
  
  // ตรวจสอบว่าถึงเวลาอ่านค่าเซ็นเซอร์และอัปเดตจอ (ทุก 0.5 วินาที)
  if(currentMillis - previousMillisLCD >= lcdInterval) {
    previousMillisLCD = currentMillis;
    
    // อ่านค่าความขุ่น (ใช้ไฟ 5V)
    int sensorValue = analogRead(sensorPin);
    float voltage = sensorValue * (5.0 / 1024.0);
    float turbidity = 0.0;
    
    if (voltage < 2.5) {
      turbidity = 3000; 
    } else {
      turbidity = -1120.4 * (voltage * voltage) + 5742.3 * voltage - 4353.8; 
    }
    if (turbidity < 0) turbidity = 0; 

    // ==========================================
    // อัปเดตหน้าจอ LCD 16x2 (โชว์ผลทันที)
    // ==========================================
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("NTU: ");
    lcd.print(turbidity, 1);
    
    lcd.setCursor(0, 1);
    if (turbidity <= 5.0) {
      lcd.print("Status: NORMAL"); // น้ำปกติ
    } else if (turbidity <= 15.0) {
      lcd.print("Status: ALERT");  // เริ่มขุ่น
    } else {
      lcd.print("Status: DIRTY");  // ขุ่นมาก/น้ำเสีย
    }

    // ==========================================
    // ส่งข้อมูลไปที่ Next.js API (ทำแค่ทุกๆ 5 วินาที)
    // ==========================================
    if (currentMillis - previousMillisAPI >= apiInterval) {
      previousMillisAPI = currentMillis;
      
      Serial.println("\n--- อัปเดตข้อมูลขึ้นคลาวด์ ---");
      Serial.print("ค่าความขุ่น (Turbidity): ");
      Serial.print(turbidity);
      Serial.println(" NTU");

      if(WiFi.status() == WL_CONNECTED){
        WiFiClientSecure client;
        client.setInsecure(); // ไม่เช็คใบรับรอง SSL
        HTTPClient http;
        
        String httpRequestData = "{\"turbidity\":" + String(turbidity) + "}";
        Serial.print("Sending Data: ");
        Serial.println(httpRequestData);
        
        http.begin(client, serverName);
        http.addHeader("Content-Type", "application/json");
        
        int httpResponseCode = http.POST(httpRequestData);
        
        if (httpResponseCode > 0) {
          Serial.print("HTTP Response code: ");
          Serial.println(httpResponseCode);
        } else {
          Serial.print("Error code: ");
          Serial.println(httpResponseCode);
        }
        http.end();
      } else {
        Serial.println("ข้ามการส่งข้อมูล (Offline Mode)");
      }
      Serial.println("-------------------------");
    }
  }
}