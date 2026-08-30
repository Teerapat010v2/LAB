import dbConnect from '../../utils/dbConnect';
import Settings from '../../models/SettingsModel';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      let settings = await Settings.findOne().lean();
      if (!settings) {
        settings = await Settings.create({});
      }
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = new Settings();
      }
      const { contactName, contactPhone, contactNote } = req.body;
      
      if (contactName !== undefined) settings.contactName = contactName;
      if (contactPhone !== undefined) settings.contactPhone = contactPhone;
      if (contactNote !== undefined) settings.contactNote = contactNote;

      await settings.save();
      res.status(200).json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
