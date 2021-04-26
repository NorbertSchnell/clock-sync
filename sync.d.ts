interface Status {
  status: string;
  statusDuration: number;
  timeOffset: number;
  frequencyRatio: number;
  connection: string;
  connectionDuration: number;
  connectionTimeOut: number;
  travelDuration: number;
  travelDurationMin: number;
  travelDurationMax: number;
}

type GetTimeFunction = () => number;
type SendFunction = (pingId: number, clientPingTime: number) => void;
type ReceiveFunction = (callback: Function) => void;
type StatusFunction = (status: Status) => void;

 declare class SyncClient {
  constructor(getTimeFunction: GetTimeFunction);
  getSyncTime(): number;
  start(sendFunction: SendFunction, receiveFunction: ReceiveFunction, statusFunction: StatusFunction): void;
}
