import axios, { AxiosError } from 'axios';

import { apiUrl, parseList } from './config';
import {
  Order,
  Hero,
  AccountRepresentative,
  ShippingStatus,
} from '../interfaces';

const getHeroAsync = async function(email: string) {
  // TODO
  try {
    const response = await axios.get(`${apiUrl}/heroes?email=${email}`);
    const data = parseList<Hero>(response);
    const hero = data[0];
    return hero;
  } catch (error) {
    handleAxiosErrors(error, 'Hero');
  }
};

const getOrdersAsync = async function(heroId: number) {
  // TODO
  try {
    const response = await axios.get(`${apiUrl}/orders/${heroId}`);
    const data = parseList<Order>(response);
    return data;
  } catch (error) {
    handleAxiosErrors(error, 'Order');
  }
};

const getAccountRepAsync = async function(heroId: number) {
  // TODO
  try {
    const response = await axios.get(`${apiUrl}/accountreps/${heroId}`);
    const data = parseList<AccountRepresentative>(response);
    return data[0];
  } catch (error) {
    handleAxiosErrors(error, 'Account rep');
  }
};

const getShippingStatusAsync = async function(orderNumber: number) {
  // TODO
  try {
    const response = await axios.get(
      `${apiUrl}/shippingstatuses/${orderNumber}`,
    );
    const data = parseList<ShippingStatus>(response);
    return data[0];
  } catch (error) {
    handleAxiosErrors(error, 'Shipping status');
  }
};

const getHeroTreeAsync = async function(email: string) {
  // TODO
  const hero = await getHeroAsync(email);
  if (!hero) return;

  const [orders, accountRep] = await Promise.all([
    getOrdersAsync(hero.id),
    getAccountRepAsync(hero.id),
  ]);

  hero.orders = orders;
  hero.accountRep = accountRep;

  const getAllStatusesAsync = orders.map(
    async (o: Order) => await getShippingStatusAsync(o.num),
  );

  // 2 techniques différentes : await Promise.all et for await

  // const shippingStatuses = await Promise.all(getAllStatusesAsync);

  // for (const ss of shippingStatuses) {
  //   const order = hero.orders.find((o: Order) => o.num === ss.orderNum);
  //   order.shippingStatus = ss;
  // }

  for await (const ss of getAllStatusesAsync) {
    const order = hero.orders.find((o: Order) => o.num === ss.orderNum);
    order.shippingStatus = ss;
  }

  return hero;
};

function handleAxiosErrors(error: AxiosError, model: string) {
  /**
   * This is a technical error, targeting the developers.
   * You should always log it here (lowest level). This serves the developer.
   * If I want to propogate this back to the callers,
   * I should determine how to propogate it out and if I want to transform it.
   */
  console.error(`Developer Error: Async Data Error: ${error.message}`);

  /**
   *  How do I feel about errors in this path?
   * Log the error here,
   * and let the caller know an error occurred,
   * but dont change the return type
   */
  throw new Error(`Oh no! We're unable to fetch the ${model}`);

  /**
   * Throw errors or return them?
   *
   * We could pass this back every time.
   * the argument here is you can avoid try/catch everywhere but you instead have to package the error.
   * interface Message {
   *   response: any;
   *   error: string;
   * }
   *
   * return the error object to the caller, to be examined
   * return {response, error};
   */
}

export { getHeroTreeAsync };
