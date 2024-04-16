console.log(
    '[' +

    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    .split('')
    .map((x)=>`"${x}"`)
    .join(', ')

    + ']'
);

console.log(
    '[' +
    
    "abcdefghijklmnopqrstuvwxyz"
    .split('')
    .map((x)=>`"${x}"`)
    .join(', ')

    + ']'
);