import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });
  
  it("should update an order", async () => {
    const customerRepository = new CustomerRepository();
    const productRepository = new ProductRepository();
    const orderRepository = new OrderRepository();

    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);
    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );
    
    const order = new Order("123", "123", [orderItem]);
    await orderRepository.create(order);
    
    const product2 = new Product("456", "Product 2", 20);
    await productRepository.create(product2);
    const orderItem2 = new OrderItem(
      "2",
      product2.name,
      product2.price,
      product2.id,
      3
    );

    order.addItem(orderItem2);
    await orderRepository.update(order);
    const updatedOrder = await orderRepository.find(order.id);

    expect(updatedOrder).toStrictEqual(order);
  });

  it("should find one order", async () => {
    const customerRepository = new CustomerRepository();
    const productRepository = new ProductRepository();
    const orderRepository = new OrderRepository();

    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);
    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);
    await orderRepository.create(order);
    const orderResult = await orderRepository.find(order.id);

    expect(orderResult).toStrictEqual(order);
  });

  it("should find all orders", async () => {
    const customerRepository = new CustomerRepository();
    const productRepository = new ProductRepository();
    const orderRepository = new OrderRepository();

    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const customer2 = new Customer("456", "Customer 2");
    const address2 = new Address("Street 2", 2, "Zipcode 2", "City 1");
    customer2.changeAddress(address2);
    await customerRepository.create(customer2);

    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);
    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const product2 = new Product("456", "Product 2", 10);
    await productRepository.create(product2);
    const orderItem2 = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      1
    );

    const order = new Order("123", "123", [orderItem]);
    await orderRepository.create(order);

    const order2 = new Order("456", "456", [orderItem2]);
    await orderRepository.create(order2);

    const orderResults = await orderRepository.findAll();

    expect(orderResults).toContainEqual(order);
    expect(orderResults).toContainEqual(order2);
  });
});
