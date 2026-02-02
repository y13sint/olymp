import db from '../../infrastructure/database/models/index.cjs'

const { Product, Inventory } = db

export async function updateProductQuantity(productId, quantityChange, reason, transaction = null) {
  const product = await Product.findByPk(productId, transaction ? { transaction } : undefined)
  if (!product) throw new Error('Продукт не найден')

  const newQuantity = parseFloat(product.quantity) + quantityChange
  if (newQuantity < 0) throw new Error('Остаток не может быть отрицательным')

  product.quantity = newQuantity
  await product.save(transaction ? { transaction } : undefined)

  await Inventory.create({
    productId,
    quantityChange,
    reason: reason || (quantityChange > 0 ? 'Пополнение' : 'Списание'),
  }, transaction ? { transaction } : undefined)

  const isLow = newQuantity <= parseFloat(product.minQuantity)
  return { product, newQuantity, isLow }
}

export async function restockFromRequest(productId, quantity, requestId, transaction = null) {
  return updateProductQuantity(productId, quantity, `Закупка по заявке #${requestId}`, transaction)
}

export function isLowStock(product) {
  return parseFloat(product.quantity) <= parseFloat(product.minQuantity)
}

export async function getProductsWithLowStockFlag() {
  const products = await Product.findAll({ order: [['name', 'ASC']] })
  return products.map(p => ({ ...p.toJSON(), isLow: isLowStock(p) }))
}
