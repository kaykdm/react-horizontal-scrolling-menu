import React from "react";
// import React from '../node_modules/react'

import throttle from 'lodash/throttle'

// NOTE: hide scrollbar
// import './hideScrollbar.css'

import { ScrollMenu, VisibilityContext } from "react-horizontal-scrolling-menu";

function throttleFn(fn) {
  return throttle(fn, 150)
}

const elemPrefix = "test";
const getId = (index) => `${elemPrefix}${index}`;

const getItems = () =>
  Array(20)
    .fill(0)
    .map((_, ind) => ({ id: getId(ind) }));

  const onWheel = throttle((api, ev) => {
    // NOTE: no good standart way to distinguish touchpad scrolling gestures
    // but can assume that gesture will affect X axis, mouse scroll only Y axis 
    // of if deltaY too small probably is it touchpad
    const isThouchpad = Math.abs(ev.deltaX) !== 0 || Math.abs(ev.deltaY) < 15

    if (isThouchpad) { 
      ev.stopPropagation()
      return false
    }

    if (ev.deltaY < 0) {
      api.scrollNext()
    } else if (ev.deltaY > 0) {
      api.scrollPrev()
    }
  }, 250)

function App() {
  const [items, setItems] = React.useState(getItems);
  const [selected, setSelected] = React.useState([]);
  const [position, setPosition] = React.useState(0);
  const [mounted, setMounted] = React.useState(false);

  

  React.useEffect(() => {
    setTimeout(() => {
      const newItems = items.concat(
        Array(5)
          .fill(0)
          .map((_, ind) => ({ id: getId(items.length + ind) }))
      );
      console.log("push new items");
      setItems(newItems);
    }, 3000);
  }, []);

  const toggleSelected = (id) => {
    const isSelected = selected.find((el) => el === id);

    setSelected((currentSelected) =>
      isSelected
        ? currentSelected.filter((el) => el !== id)
        : currentSelected.concat(id)
    );
  };

  const onInit = React.useCallback(({ scrollContainer }) => {
    scrollContainer.current.scrollLeft = position;
    setMounted(true);
  }, [position]);

  const savePosition = React.useCallback(throttle(({ scrollContainer }) => {
    setPosition(scrollContainer.current.scrollLeft)
  }, 500), []);

  // NOTE: can use items without id for padding
  return (
    <div style={{ opacity: +mounted }}>
      <ScrollMenu
        LeftArrow={LeftArrow}
        RightArrow={RightArrow}
        onInit={onInit}
        throttle={throttleFn}
        onScroll={savePosition}
        onWheel={onWheel}
      >
        {items.map(({ id }) => (
          <Card
            title={id}
            itemId={id} // NOTE: itemId is required for track items
            key={id}
            onClick={() => toggleSelected(id)}
            selected={!!selected.find((el) => el === id)}
          />
        ))}
      </ScrollMenu>
    </div>
  );
}

function LeftArrow() {
  const { isFirstItemVisible, scrollPrev } = React.useContext(VisibilityContext)

  return (
    <Arrow disabled={isFirstItemVisible} onClick={scrollPrev}>
      Left
    </Arrow>
  );
}

function RightArrow() {
  const { isLastItemVisible, scrollNext } = React.useContext(VisibilityContext)

  return (
    <Arrow disabled={isLastItemVisible} onClick={scrollNext}>
      Right
    </Arrow>
  );
}

function Arrow({ children, disabled, onClick }) {
  return (
    <div
      disabled={disabled}
      onClick={onClick}
      style={{
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        right: "1%",
        opacity: disabled ? "0" : "1",
        userSelect: "none",
      }}
    >
      {children}
    </div>
  );
}

function Card({ onClick, selected, title, itemId }) {
  const { isItemVisible } = React.useContext(VisibilityContext)


  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid",
        display: "inline-block",
        margin: "0 10px",
        width: "160px",
      }}
      tabIndex="0"
    >
      <div className="card">
        <div>{title}</div>
        <div>visible: {JSON.stringify(!!isItemVisible(itemId))}</div>
        <div>selected: {JSON.stringify(!!selected)}</div>
      </div>
      <div
        style={{
          backgroundColor: selected ? "green" : "bisque",
          height: "200px",
        }}
      />
    </div>
  );
}

export default App;
