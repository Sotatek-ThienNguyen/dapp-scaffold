export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


export  function binaryArrayToNumber(arr: Uint8Array): number  {
    let len = arr.length;
    let pow: any = [];
    let decimal: any = [];
    for (let i = 0; i <= len - 1; i++) {
      pow.unshift(i);
    }
    arr.forEach((x, index) => {
      decimal.push(x * 2 ** pow[index]);
    });
    let toDecimal = decimal.reduce((acc: number, curr: number) => acc + curr, 0);
    return toDecimal;
  };