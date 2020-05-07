import neatCsv from 'neat-csv';
import fs from 'fs';
import { getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestDTO {
  path: string;
}

class ImportTransactionsService {
  async execute({ path }: RequestDTO): Promise<Transaction[]> {
    const transactionRepository = getRepository(Transaction);
    const categoriesRepository = getRepository(Category);

    const transactions_data = await neatCsv(fs.createReadStream(path), {
      mapValues: ({ value }) => value.trim(),
      mapHeaders: ({ header }) => header.trim(),
    });

    const categoryTitles = transactions_data.map(transac => transac.category);

    const existingCategories = await categoriesRepository.find({
      where: { title: In(categoryTitles) },
    });

    const existingTitles = existingCategories.map((cat: Category) => cat.title);

    const categoriesToCreateSet: Set<string> = new Set();
    // Adding the ones to add in the Set
    categoryTitles.forEach(title => {
      if (!existingTitles.includes(title)) {
        categoriesToCreateSet.add(title);
      }
    });

    const categoriesToCreate = Array.from(categoriesToCreateSet).map(title => ({
      title,
    }));
    const readyCategories = categoriesRepository.create(categoriesToCreate);
    const newCategories = await categoriesRepository.save(readyCategories);

    const allCategories = [...existingCategories, ...newCategories];

    const transactionsToCreate = transactionRepository.create(
      transactions_data.map(transac => ({
        title: transac.title,
        category_id: allCategories.find(cat => cat.title === transac.category)
          ?.id,
        type: transac.type,
        value: parseInt(transac.value, 10),
      })),
    );

    const newTransactions = await transactionRepository.save(
      transactionsToCreate,
    );

    return newTransactions;
  }
}

export default ImportTransactionsService;
