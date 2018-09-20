import isRequired from '../utils/isRequired'

/**
 * EventListener is used to watch events on the blockchain for a set of contracts.
 * Handlers for specific events can be added. When an event log is found EventListener
 * will fire all handlers registered for the contract.
 */
class EventListener {
  /**
   * Fetch logs from contractInstance for a specific event in a block range.
   * @param {object} contractInstance - Contract instance.
   * @param {string} eventName - Name of the event.
   * @param {number} fromBlock - Lower bound of search range.
   * @param {number} toBlock - Upper bound of search range.
   * @param {object} filters - Extra filters
   * @returns {Promise} All events in block range.
   */
  static getEventLogs = async (
    contractInstance = isRequired('contractInstance'),
    eventName = isRequired('eventName'),
    fromBlock = 0,
    toBlock = 'latest',
    filters = {}
  ) =>
    contractInstance.getPastEvents(eventName, {
      filter: filters,
      fromBlock,
      toBlock
    })
}

export default EventListener
