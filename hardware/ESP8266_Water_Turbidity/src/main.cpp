#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h> // เพิ่ม Library สำหรับรองรับลิงก์ HTTPS
#include <WiFiManager.h>

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

unsigned long previousMillis = 0;
const long interval = 10000; // ส่งข้อมูลทุกๆ 10 วินาที

// ==========================================
// การตั้งค่า Wi-Fi (เปลี่ยนเป็นชื่อและรหัสผ่านมือถือของคุณ)
// ==========================================
const char* ssid = "ชื่อไวไฟมือถือของคุณ"; 
const char* password = "รหัสผ่านไวไฟของคุณ";

void setup() {
  Serial.begin(115200);
  
  pinMode(ledGreenPin, OUTPUT);
  pinMode(ledRedPin, OUTPUT);
  
  // เริ่มต้นมา ไฟแดงติด (แสดงว่ายังไม่ได้ต่อเน็ต)
  digitalWrite(ledRedPin, HIGH);
  digitalWrite(ledGreenPin, LOW);

  Serial.println();
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  // รอจนกว่าจะเชื่อมต่อสำเร็จ
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // ถ้าโค้ดวิ่งมาถึงบรรทัดนี้ แปลว่า "ต่อ Wi-Fi สำเร็จแล้ว!" 🎉
  Serial.println("\nConnected to Home WiFi!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  
  // เปลี่ยนไฟเป็นสีเขียว
  digitalWrite(ledGreenPin, HIGH);
  digitalWrite(ledRedPin, LOW);
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
  
  // ตรวจสอบว่าถึงเวลาที่ต้องส่งข้อมูลหรือยัง
  if(currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    
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
    
    Serial.println("\n--- กำลังวัดคุณภาพน้ำ ---");
    Serial.print("ค่าอนาล็อก (Sensor Value): ");
    Serial.println(sensorValue);
    Serial.print("แรงดันไฟฟ้า (Voltage): ");
    Serial.print(voltage);
    Serial.println(" V");
    Serial.print("ค่าความขุ่น (Turbidity): ");
    Serial.print(turbidity);
    Serial.println(" NTU");

    if (turbidity > TURBIDITY_THRESHOLD) {
      Serial.println("สถานะ: แจ้งเตือน! น้ำมีความขุ่นเกินเกณฑ์");
    } else {
      Serial.println("สถานะ: น้ำใส ปกติดี");
    }
    Serial.println("-------------------------");

    // ==========================================
    // ส่งข้อมูลไปที่ Next.js API
    // ==========================================
    if(WiFi.status() == WL_CONNECTED){
      WiFiClientSecure client;
      client.setInsecure(); // ไม่เช็คใบรับรอง SSL เพื่อให้เชื่อมต่อ Vercel (https) ได้ง่ายขึ้น
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
    }
  }
}