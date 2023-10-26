// import EventHandler from 'bootstrap5/js/src/dom/event-handler';

export const elements = [];
export const events = [];

const originalAddEventListener = document.addEventListener;
document.addEventListener = (event, callback) => {
  originalAddEventListener(event, callback);

  let apply = (element) => {
    element.addEventListener(event, (ev) => {
      const origPreventDefault = ev.preventDefault;
      ev.preventDefault = () => origPreventDefault.call(ev);

      const newEvent = Object.create(ev, {
        target: {
          value: ev.composedPath()[0]
        },
        key: {
          value: ev.key
        }
      });
      callback(newEvent);
    });
  };

  // if (callback.uidEvent !== undefined) {
  //   // Wrapped BS event, we need to re-wrap
  //   apply = (element) =>
  //     // EventHandler.on(
  //     //   element,
  //     //   // regenerate the originalTypeEvent from the uidEvent and event type
  //     //   `${event}.${callback.uidEvent.replace(/::.*/, '')}`,
  //     //   callback.delegationSelector,
  //     //   callback.callable
  //     // );
  //     console.log("Unwrapped event", callback.uidEvent);
  // }

  events.push(apply);
  elements.forEach((element) => {
    apply(element);
  });
};
