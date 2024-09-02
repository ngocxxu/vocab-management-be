import cron from 'node-cron';
import { EXAM_URL } from '../../constants/User.contants.js';
import { VocabReminderModel } from '../../models/VocabReminder.models.js';
import { sendReminderEmail } from '../../services/Email.services.js';
import { TVocabRemiderRes } from '../../types/VocabTrainer.types.js';
import { UserModel } from '../../models/User.models.js';

const sendReminders = async () => {
  const today = new Date();
  const data = (await VocabReminderModel.find({})
    .populate('vocabTrainer')
    .lean()) as unknown as TVocabRemiderRes[];
  const users = await UserModel.find({}).lean();

  data.forEach((test) => {
    if (!test.disabled) {
      const name = test.vocabTrainer.nameTest;
      const daysSinceLastReminder =
        (today.getTime() - test.lastRemind.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastReminder >= test.repeat) {
        const subject = `Reminder: Complete your test - "${name}"`;

        users.forEach((user) => {
          const text = `
            Hello ${user.email},
            This is a reminder to complete your test: "${name}".
            Repeat: ${test.repeat} days
            Please click on the following link to complete your test: ${EXAM_URL.replace(
              ':id',
              test.vocabTrainer._id
            )}`;

          sendReminderEmail(user.email, subject, text)
            .then(async () => {
              // Update the last reminder date
              await VocabReminderModel.findByIdAndUpdate(test._id, {
                lastRemind: today,
              });
            })
            .catch((error) =>
              console.error(
                `Error sending email to ${user.email} for ${name}:`,
                error
              )
            );
        });
      }
    }
  });
};

// Everyday at 9am
cron.schedule('0 9 * * *', () => {
  console.log('Running reminder email job...');
  sendReminders();
});
