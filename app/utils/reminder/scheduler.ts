import cron from 'node-cron';
import { VocabReminderModel } from '../../models/VocabReminder.models';
import { sendReminderEmail } from '../../services/Email.services';
import {
  TVocabRemiderRes
} from '../../types/VocabTrainer.types';

const email = process.env.EMAIL_USER_RECEIVER || '';

const user = {
  email
};

const sendReminders = async () => {
  const data: TVocabRemiderRes[] = await VocabReminderModel.find({})
    .populate('vocabTrainer')
    .lean();

  data.forEach((test) => {
    if (!test.disabled) {
      const subject = `Reminder: Complete your test`;
      const text = `Hello ${user.email}, this is a reminder to complete your test: ${test.vocabTrainer.nameTest}.`;

      sendReminderEmail(user.email, subject, text)
        .then(() =>
          console.log(
            `Email sent to ${user.email} for ${test.vocabTrainer.nameTest}`
          )
        )
        .catch((error) =>
          console.error(
            `Error sending email to ${user.email} for ${test.vocabTrainer.nameTest}:`,
            error
          )
        );
    }
  });
};

cron.schedule('0 9 * * *', () => {
  console.log('Running reminder email job...');
  sendReminders();
});
