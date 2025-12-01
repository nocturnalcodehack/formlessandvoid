import { Sequelize, QueryTypes } from 'sequelize';

let sequelize;

async function qualify(req, res) {
  console.log("req body:", req.body);
  try {
    await connectToDb();
    const dbResult = await callDb(req);
    if (dbResult.status == 200) {
      dbResult.message[0].model_resp = run_model(req, dbResult.message[0].model);
      const model_resp = run_model(req, dbResult);
      res.status(dbResult.status).json(model_resp.message);
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function connectToDb() {
  if (!sequelize) {
    let dialectOptions = {
      timezone: process.env.DB_TIMEZONE,
    };

    if (process.env.DB_SSL_MODE === 'require') {
      dialectOptions.ssl = {
        require: true,
        rejectUnauthorized: false // added based on Node.js deprecation notice
      };
    }

    sequelize = new Sequelize({
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      dialect: 'postgres',
      dialectModule: require('pg'),
      logging: false,
      dialectOptions: dialectOptions
    });
    await sequelize.authenticate();
    console.log('Connection to db has been established successfully.');
  }
}

async function callDb(req) {
  if (!req.body || !req.body.form_zip) {
    return { status: 400, message: 'Bad request: form_zip is required' };
  }

  const { form_zip } = req.body;

  try {
    const sql_resp = await sequelize.query('SELECT * FROM preploans.zip_models WHERE zip_code = ?', {
      replacements: [form_zip],
      type: QueryTypes.SELECT,
    });

    console.log('sql response:', sql_resp);

    return {
      status: 200,
      message: sql_resp
    };
  } catch (error) {
    console.error('Unable to call db:', error);
    throw error; // Propagate the error up to the calling function
  }
}ç


function run_model(req, model) {
  console.log("model was run");
  return {
    status: 200,
    message: "model"
  };
}


export default qualify;