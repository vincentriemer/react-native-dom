declare module "pepjs" {
}

declare class PointerEvent extends MouseEvent {
  +pointerId: number;
  +width: number;
  +height: number;
  +pressure: number;
  +tangentialPressure: number;
  +tiltX: number;
  +tiltY: number;
  +twist: number;
  +pointerType: "mouse" | "pen" | "touch";
  +isPrimary: boolean;
  +which: number;
  getCoalescedEvents(): PointerEvent[];
}
