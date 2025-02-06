import cron from 'node-cron';
import { EXAM_URL } from '../../constants/User.contants.js';
import { VocabReminderModel } from '../../models/VocabReminder.models.js';
import { sendReminderEmail } from '../../services/Email.services.js';
import { TVocabRemiderRes } from '../../types/VocabTrainer.types.js';
import { UserModel } from '../../models/User.models.js';

const sendReminders = async () => {
  try {
    const today = new Date();
    const data = (await VocabReminderModel.find({})
      .populate('vocabTrainer')
      .lean()) as unknown as TVocabRemiderRes[];
    const users = await UserModel.find({}).lean();

    for (const test of data) {
      // Add null checks
      if (!test.disabled && test.vocabTrainer && test.lastRemind) {
        const name = test.vocabTrainer.nameTest || 'Unnamed Test';

        // Ensure lastRemind is a valid date
        const lastRemindDate =
          test.lastRemind instanceof Date
            ? test.lastRemind
            : new Date(test.lastRemind);

        const daysSinceLastReminder =
          (today.getTime() - lastRemindDate.getTime()) / (1000 * 60 * 60 * 24);

        if (daysSinceLastReminder >= test.repeat) {
          const subject = `Reminder: Complete your test - "${name}"`;

          for (const user of users) {
            try {
              const text = `
                Hello ${user.email},
                This is a reminder to complete your test: "${name}".
                Repeat: ${test.repeat} days
                Please click on the following link to complete your test: ${EXAM_URL.replace(
                  ':id',
                  test.vocabTrainer._id
                )}`;

              await sendReminderEmail(user.email, subject, text);

              // Update the last reminder date
              await VocabReminderModel.findByIdAndUpdate(test._id, {
                lastRemind: today,
              });
            } catch (emailError) {
              console.error(
                `Error sending email to ${user.email} for ${name}:`,
                emailError
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in sendReminders:', error);
  }
};

// Everyday at 9am
cron.schedule('0 9 * * *', () => {
  console.log('Running reminder email job...');
  sendReminders();
});
