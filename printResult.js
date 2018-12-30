function printResult(moves){
    console.log("\n\n");
    console.log("+ --------------------------- +");
    console.log(`|    ${moves['1']}    |    ${moves['2']}    |    ${moves['3']}    |`);
    console.log("+ ------- + ------- + ------- +");
    console.log(`|    ${moves['4']}    |    ${moves['5']}    |    ${moves['6']}    |`);
    console.log("+ ------- + ------- + ------- +");
    console.log(`|    ${moves['7']}    |    ${moves['8']}    |    ${moves['9']}    |`);
    console.log("+ --------------------------- +");
    console.log("\n\n");
}

module.exports = printResult;