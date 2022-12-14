import { ObjectId } from 'mongodb';
import { AddAccountRepository } from '../../../../data/protocols/db/account/add-account-repository';
import { LoadAccountByEmailRepository } from '../../../../data/protocols/db/account/load-account-by-email-repository';
import { UpdateAccessTokenRepository } from '../../../../data/protocols/db/account/update-access-token-repository';
import { AccountModel } from '../../../../domain/models/account/account-model';
import { AddAccountModel } from '../../../../domain/usecases/add-account';
import { Either, left, rigth } from '../../../../shared/either/either';
import { AccountNotFoundDbError } from '../../../errors/account-not-found-db-error';
import { MongoHelper } from '../helpers/mongo-helper';

export class AccountMongoRepository
  implements
    AddAccountRepository,
    LoadAccountByEmailRepository,
    UpdateAccessTokenRepository
{
  async add(accountData: AddAccountModel): Promise<AccountModel> {
    const accountCollection = await MongoHelper.getCollection('accounts');
    const result = await accountCollection.insertOne(accountData);
    const { insertedId: id } = result;

    const account = MongoHelper.map(await accountCollection.findOne({ _id: id }));
    return account;
  }

  async loadByEmail(
    email: string
  ): Promise<Either<AccountNotFoundDbError, AccountModel>> {
    const accountCollection = await MongoHelper.getCollection('accounts');
    let account = await accountCollection.findOne({ email });
    if (!account) {
      return left(new AccountNotFoundDbError(`Account with email: '${email}' not found`));
    }
    return rigth(MongoHelper.map(account));
  }

  async updateAccessToken(id: string, token: string): Promise<void> {
    const accountCollection = await MongoHelper.getCollection('accounts');
    await accountCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { accessToken: token } }
    );
  }
}
