const SplitPayment = artifacts.require('SplitPayment');

contract('SplitPayment', (accounts) => {
  let splitPayment = null;
  before(async () => {
    splitPayment = await SplitPayment.deployed();
  });

  it('should split payment', async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]]
    const amounts = [40, 20, 30]
    const initialBalances = await Promise.all(
      recipients.map((recipient) => {
        return web3.eth.getBalance(recipient)
      }));
    await splitPayment.send(recipients, amounts, { from: accounts[0], value: 90 })
    const finalBalances = await Promise.all(
      recipients.map((recipient) => {
        return web3.eth.getBalance(recipient)
      }));
    recipients.forEach((_item, i) => {
      const diff = web3.utils.toBN(finalBalances[i]).sub(web3.utils.toBN(initialBalances[i]))
      assert(diff.toNumber() === amounts[i])
    })
  })

  it('should NOT split payment if array length mismatch', async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]]
    const amounts = [40, 20]
    try {
      await splitPayment.send(recipients, amounts, { from: accounts[0], value: 90 })
    } catch (err) {
      assert(err.message.includes('to must be same length as amount'))
      return;
    }
    assert(false);
  })

  it('should NOT split payment if caller is not owner', async () => {
    const recipients = [accounts[1], accounts[2], accounts[3]]
    const amounts = [40, 20, 30]
    try {
      await splitPayment.send(recipients, amounts, { from: accounts[1], value: 90 })
    } catch (err) {
      assert(err.message.includes('VM Exception while processing transaction: revert'))
      return;
    }
    assert(false);
  })
});
