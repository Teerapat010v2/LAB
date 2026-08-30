// Since this was previously in-memory state, we'll implement a simple mock or use a DB model if we want it persistent.
// For now, let's keep it simple. In a true serverless env, memory state resets.
// I will just return the static object for now. If they try to update, it succeeds but doesn't persist (since they didn't have a contact DB model before anyway, it reset on backend restart).

let contactCache = {
  name: 'ผู้ดูแลระบบประปา',
  phone: '080-123-4567',
  note: 'ติดต่อเมื่อมีเหตุฉุกเฉิน',
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json(contactCache);
  } else if (req.method === 'POST') {
    contactCache = {
      ...contactCache,
      ...req.body
    };
    res.status(200).json(contactCache);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
