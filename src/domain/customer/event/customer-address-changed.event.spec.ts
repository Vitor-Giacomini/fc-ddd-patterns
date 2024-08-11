import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerAddressChangedEvent from "./customer-address-changed.event";
import ConsoleLogHandler from "./handler/console-log.handler";

describe('CustomerAddressChangedEvent', () => {
  it('should call all handlers', () => {
    const eventData = { id: 1, name: 'Customer 1', address: 'Street 1'};
    const eventDispatcher = new EventDispatcher();
    const customerAddressChangedEvent = new CustomerAddressChangedEvent(eventData);
    const enviaConsoleLogHandler = new ConsoleLogHandler();

    eventDispatcher.register('CustomerAddressChangedEvent', enviaConsoleLogHandler);

    const handleSpy = jest.spyOn(enviaConsoleLogHandler, 'handle');

    eventDispatcher.notify(customerAddressChangedEvent);

    expect(handleSpy).toHaveBeenCalledTimes(1);
    expect(handleSpy).toHaveBeenCalledWith(customerAddressChangedEvent);
  });
});