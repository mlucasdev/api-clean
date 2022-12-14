import { Collection } from 'mongodb';
import { MongoHelper } from '../helpers/mongo-helper';
import { LogMongoRepository } from './log-mongo-repository';

describe('Log Mongo Repository', () => {
  let errorColletion: Collection;
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL);
  });

  afterAll(async () => {
    await MongoHelper.disconnect();
  });

  beforeEach(async () => {
    errorColletion = await MongoHelper.getCollection('errors');
    await errorColletion.deleteMany({});
  });

  test('Should create an error log on sucess', async () => {
    const sut = new LogMongoRepository();
    await sut.logError('any_error');
    const count = await errorColletion.countDocuments();
    expect(count).toBe(1);
  });
});
