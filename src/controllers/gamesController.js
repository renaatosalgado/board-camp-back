import db from "../db.js";
import SqlString from 'sqlstring';

export async function getGames(req, res) {
  const { name, offset, limit, order, desc } = req.query;

  try {
    let offsetValue = "";
    if (offset) {
      offsetValue = `OFFSET ${SqlString.escape(offset)}`;
    }

    let limitValue = "";
    if (limit) {
      limitValue = `LIMIT ${SqlString.escape(limit)}`;
    }

    let orderByValue = "";
    if (order) {
      orderByValue = `ORDER BY ${SqlString.escape(order)}`;
    }

    let descCondition = "";
    if (desc) {
      descCondition = `DESC`;
    }

    if (name) {
      const resultName = await db.query(
        `SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON categories.id=games."categoryId" WHERE UPPER (games.name) LIKE UPPER ($1) ${limitValue} ${offsetValue} ${orderByValue} ${descCondition}`,
        [`${name}%`]
      );
      return res.send(resultName.rows);
    }

    const result = await db.query(`
            SELECT games.*, categories.name AS "categoryName" FROM games JOIN categories ON categories.id=games."categoryId" ${limitValue} ${offsetValue} ${orderByValue} ${descCondition}
        `);

    if (result.rowCount === 0) {
      return res.status(404).send("Nenhum jogo encontrado.");
    }

    res.send(result.rows);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function createGame(req, res) {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

  try {
    const resultCategoryId = await db.query(
      `
        SELECT * FROM categories WHERE id = $1
    `,
      [categoryId]
    );

    if (resultCategoryId.rowCount === 0) return res.sendStatus(400);

    const resultName = await db.query(
      `
        SELECT * FROM games WHERE name = $1
    `,
      [name]
    );

    if (resultName.rowCount > 0) {
      return res.status(409).send("Jogo já cadastrado.");
    }

    await db.query(
      `
        INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5)
    `,
      [name, image, stockTotal, categoryId, pricePerDay]
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send(error);
  }
}
