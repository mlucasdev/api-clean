import { Collection } from 'mongodb';
import request from 'supertest';
import { MongoHelper } from '../../infra/db/mongodb/helpers/mongo-helper';
import app from '../config/app';
import { hash } from 'bcrypt';

let accountColletion: Collection;
describe('Login Routes', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  beforeEach(async () => {
    accountColletion = await MongoHelper.getCollection('accounts');
    await accountColletion.deleteMany({});
  });

  describe('POST /signup', () => {
    test('Should return 201 on signup', async () => {
      await request(app)
        .post('/api/signup')
        .send({
          name: 'Lucas',
          email: 'lucas@mail.com',
          password: '123',
          passwordConfirmation: '123',
        })
        .expect(201);
    });
  });

  describe('POST /login', () => {
    test('Should return 200 on login', async () => {
      const password = await hash('123', 12);
      await accountColletion.insertOne({
        name: 'Lucas',
        email: 'lucas@mail.com',
        password,
      });

      await request(app)
        .post('/api/login')
        .send({
          email: 'lucas@mail.com',
          password: '123',
        })
        .expect(200);
    });
  });
});
