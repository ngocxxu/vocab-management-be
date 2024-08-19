import cron from 'node-cron';
import { VocabReminderModel } from '../../models/VocabReminder.models';
import { sendReminderEmail } from '../../services/Email.services';
import { TVocabRemiderRes } from '../../types/VocabTrainer.types';

const email = process.env.EMAIL_USER_RECEIVER || '';

const user = {
  email,
};

const sendReminders = async () => {
  const today = new Date();
  const data: TVocabRemiderRes[] = await VocabReminderModel.find({})
    .populate('vocabTrainer')
    .lean();

  data.forEach((test) => {
    if (!test.disabled) {
      const name = test.vocabTrainer.nameTest;
      const daysSinceLastReminder =
        (today.getTime() - test.lastRemind.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceLastReminder >= test.repeat) {
        const subject = `Reminder: Complete your test - ${name}`;
        const text = `Hello ${user.email}, this is a reminder to complete your test: ${name}.`;

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
      }
    }
  });
};

cron.schedule('0 9 * * *', () => {
  console.log('Running reminder email job...');
  sendReminders();
});
