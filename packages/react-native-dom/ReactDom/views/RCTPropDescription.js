/** @flow */

import type RCTView from "RCTView";
import RCTPropTypes from "RCTPropTypes";
import ColorArrayFromHexARGB from "ColorArrayFromHexARGB";

type PropDef<T> = {
  name: string,
  type: string,
  setter: (view: $Subtype<RCTView>, value: ?T) => void,
  nativeOnly: boolean
};

type NumberPropDef = PropDef<number>;
type StringPropDef = PropDef<string>;
type BoolPropDef = PropDef<boolean>;
type ArrayPropDef = PropDef<Array<any>>;
type ColorPropDef = PropDef<string>;
type ObjectPropDef = PropDef<Object>;
type EventPropDef = PropDef<Function>;

export type PropDefType = PropDef<any>;

type Setter = $PropertyType<PropDefType, "setter">;

function eventSetter(propName: string) {
  return (view: RCTView, bound: ?boolean) => {
    if (bound) {
      (view: any)[propName] = (json: Object) => {
        const mutableEvent = { ...json };
        mutableEvent.target = view.reactTag;
        view.bridge.eventDispatcher.sendInputEvent(propName, mutableEvent);
      };
    } else {
      (view: any)[propName] = undefined;
    }
  };
}

class RCTPropDescription {
  viewProps: PropDefType[] = [];
  shadowProps: PropDefType[] = [];

  addShadowProp(name: string): RCTPropDescription {
    this.shadowProps.push({
      name,
      type: RCTPropTypes.string,
      setter: (view, value) => {
        view[name] = value;
      },
      nativeOnly: false
    });
    return this;
  }

  addProp(
    name: string,
    type: string,
    setter: Setter,
    nativeOnly: boolean
  ): RCTPropDescription {
    this.viewProps.push({ name, type, setter, nativeOnly });
    return this;
  }

  addMirroredProp(
    name: string,
    type: string,
    setter: Setter,
    nativeOnly: boolean = false
  ): RCTPropDescription {
    return this.addProp(name, type, setter, nativeOnly).addShadowProp(name);
  }

  addNumberProp(
    name: string,
    setter: $PropertyType<NumberPropDef, "setter">,
    nativeOnly: boolean = false
  ): RCTPropDescription {
    return this.addProp(name, RCTPropTypes.number, setter, nativeOnly);
  }

  addStringProp(
    name: string,
    setter: $PropertyType<StringPropDef, "setter">,
    nativeOnly: boolean = false
  ): RCTPropDescription {
    return this.addProp(name, RCTPropTypes.string, setter, nativeOnly);
  }

  addBooleanProp(
    name: string,
    setter: $PropertyType<BoolPropDef, "setter">,
    nativeOnly: boolean = false
  ): RCTPropDescription {
    return this.addProp(name, RCTPropTypes.bool, setter, nativeOnly);
  }

  addArrayProp(
    name: string,
    setter: $PropertyType<ArrayPropDef, "setter">,
    nativeOnly: boolean = false
  ): RCTPropDescription {
    return this.addProp(name, RCTPropTypes.array, setter, nativeOnly);
  }

  addColorProp(
    name: string,
    setter: $PropertyType<ColorPropDef, "setter">,
    nativeOnly: boolean = false
  ): RCTPropDescription {
    const betterSetter = (view: RCTView, value: ?(number | string)) => {
      if (typeof value === "number") {
        const [a, r, g, b] = ColorArrayFromHexARGB(value);
        const stringValue = `rgba(${r},${g},${b},${a})`;
        setter(view, stringValue);
      } else {
        setter(view, value);
      }
    };

    return this.addProp(name, RCTPropTypes.array, betterSetter, nativeOnly);
  }

  addObjectProp(
    name: string,
    setter: $PropertyType<ObjectPropDef, "setter">,
    nativeOnly: boolean = false
  ): RCTPropDescription {
    return this.addProp(name, RCTPropTypes.object, setter, nativeOnly);
  }

  addDirectShadowEvent(name: string): RCTPropDescription {
    const setter = eventSetter(name);
    this.shadowProps.push({
      name,
      type: RCTPropTypes.directEvent,
      setter,
      nativeOnly: false
    });
    return this;
  }

  addDirectEvent(
    name: string,
    nativeOnly: boolean = false
  ): RCTPropDescription {
    const setter = eventSetter(name);
    return this.addProp(name, RCTPropTypes.directEvent, setter, nativeOnly);
  }

  addBubblingEvent(
    name: string,
    nativeOnly: boolean = false
  ): RCTPropDescription {
    const setter = eventSetter(name);
    return this.addProp(name, RCTPropTypes.bubblingEvent, setter, nativeOnly);
  }
}

export default RCTPropDescription;
