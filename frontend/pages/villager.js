import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function OldVillagerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/user');
  }, [router]);

  return <p>กำลังเปลี่ยนเส้นทางไปยังหน้า User...</p>;
}
