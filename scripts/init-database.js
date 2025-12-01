const { sequelize, Survey, SurveyQuestion, SurveyRespondent, SurveyResponse } = require('src/models');

async function initializeDatabase() {
  try {
    console.log('🗃️  Initializing database...');

    // Force sync - this will drop existing tables and recreate them
    await sequelize.sync({ force: true });

    console.log('✅ Database tables created successfully!');
    console.log('📊 Tables created:');
    console.log('   - surveys');
    console.log('   - survey_questions');
    console.log('   - survey_respondents');
    console.log('   - survey_responses (with surveyId column)');

    // Verify the schema by showing table info
    const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('\n📋 Database tables confirmed:');
    results.forEach(table => {
      console.log(`   ✓ ${table.name}`);
    });

    // Show SurveyResponse table schema to confirm surveyId column
    const [responseSchema] = await sequelize.query("PRAGMA table_info(survey_responses);");
    console.log('\n🔍 SurveyResponse table schema:');
    responseSchema.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? '(NOT NULL)' : ''} ${col.pk ? '(PRIMARY KEY)' : ''}`);
    });

    console.log('\n🎉 Database initialization complete!');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('✅ Database setup finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  });
