import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import CreateCategoryService from './CreateCategoryService';
import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  title: string;
  value: number;
  category: string;
  type: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    category,
    type,
  }: RequestDTO): Promise<Transaction> {
    // Checking for valid transaction type
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Unknown transaction type.');
    }

    const transactionRepository = getCustomRepository(TransactionRepository);

    // Checking for valid withdraw amount
    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      if (value > balance.total) {
        throw new AppError(
          'Can not withdraw a greater amount than your balance.',
        );
      }
    }

    const createCategory = new CreateCategoryService();
    const created_category = await createCategory.execute({ title: category });

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: created_category.id,
    });

    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
