SELECT "Survey"."id", "Survey"."title", "Survey"."description", "Survey"."isActive",
       "Survey"."startDate", "Survey"."endDate", "Survey"."thankYouMessage",
       "Survey"."thankYouEmailSubject", "Survey"."thankYouEmailBody",
       "Survey"."createdBy", "Survey"."createdAt", "Survey"."updatedAt",
       "questions"."id" AS "questions_id", "questions"."questionText" AS "questions_questionText",
       "questions"."questionType" AS "questions_questionType",
       "questions"."orderIndex" AS "questions_orderIndex"
FROM surveys AS "Survey"
         LEFT OUTER JOIN survey_questions AS "questions" ON "Survey"."id" = "questions"."surveyId"
ORDER BY "Survey"."createdAt" DESC;
