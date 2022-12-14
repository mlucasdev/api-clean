import { Collection } from 'mongodb';
import { left } from '../../../../shared/either/either';
import { AccountNotFoundDbError } from '../../../errors/account-not-found-db-error';
import { MongoHelper } from '../helpers/mongo-helper';
import { AccountMongoRepository } from './account-mongo-repository';

let accountColletion: Collection;

describe('Account Mongo Repository', () => {
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

  const makeSut = (): AccountMongoRepository => {
    return new AccountMongoRepository();
  };

  test('Shuld return an account on add success', async () => {
    const sut = makeSut();
    const account = await sut.add({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password',
    });

    expect(account).toBeTruthy();
    expect(account.id).toBeTruthy();
    expect(account.name).toBe('any_name');
    expect(account.email).toBe('any_email@mail.com');
    expect(account.password).toBe('any_password');
  });

  test('Shuld return an account on loadByEmail success', async () => {
    const sut = makeSut();
    await accountColletion.insertOne({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password',
    });

    const account = await sut.loadByEmail('any_email@mail.com');
    if (account.isRigth()) {
      expect(account).toBeTruthy();
      expect(account.value.id).toBeTruthy();
      expect(account.value.name).toBe('any_name');
      expect(account.value.email).toBe('any_email@mail.com');
      expect(account.value.password).toBe('any_password');
    }
  });

  test('Shuld return null if loadByEmail fails', async () => {
    const sut = makeSut();
    const account = await sut.loadByEmail('any_email@mail.com');
    const leftError = left(
      new AccountNotFoundDbError(`Account with email: 'any_email@mail.com' not found`)
    );
    expect(account.value).toEqual(leftError.value);
  });

  test('Shuld update the account accessToken on updateAccessToken success', async () => {
    const sut = makeSut();
    const result = await accountColletion.insertOne({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password',
    });
    const { insertedId: id } = result;
    await sut.updateAccessToken(id.toString(), 'any_token');
    const account = await accountColletion.findOne({ _id: id });
    expect(account).toBeTruthy();
    expect(account?.accessToken).toBe('any_token');
  });
});
