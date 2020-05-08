import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions: Transaction[] = await this.find();

    const balance: Balance = {
      income: 0,
      outcome: 0,
      total: 0,
    };

    transactions.forEach(({ type, value }: Transaction) => {
      if (type === 'income') {
        balance.income += value;
      } else if (type === 'outcome') {
        balance.outcome += value;
      }
    });
    balance.total = balance.income - balance.outcome;
    return balance;
  }
}

export default TransactionsRepository;
