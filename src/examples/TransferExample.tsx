import { useCallback, useEffect, useRef, useState } from "react";
import {
  useAccount,
  usePrepareContractWrite,
  useContractWrite,
  useContractRead,
  useNetwork,
} from "wagmi";
import contractAbi from "../resources/contracts/polygon-mumbai/0x3870419Ba2BBf0127060bCB37f69A1b1C090992B.json";
import { Anchor, CloseButton, Flex } from '@mantine/core';
import { Page } from '../Page'

import {ethers, BigNumber} from 'ethers';

import { Box, Group, TextInput, Button, NumberInput, Alert, Grid } from '@mantine/core';

import { usePrepareContractBatchWrite, useContractBatchWrite, useWaitForAATransaction } from "@zerodevapp/wagmi";


const description = `With ZeroDev, you can pay gas for your users, so they don't have to buy ETH before using your app.

Try minting/multi-send some token below, without paying gas!`

const testTokenAddress = '0x3870419ba2bbf0127060bcb37f69a1b1c090992b';
const testTokenDecimals = 6;

function SendBatch() {
  const { address } = useAccount();

  const [balanceChanging, setBalanceChanging] = useState(false);

  const [sendInputs, setSendInputs] = useState([
    {
      "recipient": address,
      "amount": "1"
    }
  ])

  const { config } = usePrepareContractBatchWrite({
    calls: sendInputs.map(item => ({
      address: testTokenAddress,
      abi: contractAbi, 
      functionName: "transfer",
      args: [item.recipient, ethers.utils.parseUnits(item.amount?.toString() || '0', testTokenDecimals)],
    })),
    enabled: true,
  })

  const { write: batchWrite, data } = useContractBatchWrite(config) 

  useWaitForAATransaction({
    wait: data?.wait,
    onSuccess() {
      console.log("Transaction was successful.")
    }
  })

  const { data: balance = 0, refetch } = useContractRead({
    address: testTokenAddress,
    abi: contractAbi,
    functionName: "balanceOf",
    args: [address],
  });

  const interval = useRef<any>()
  const handleClick = useCallback(() => {
    if (batchWrite) {
      setBalanceChanging(true)
      batchWrite()
      interval.current = setInterval(() => {
        refetch()
      }, 1000)
      setTimeout(() => {
        if (interval.current) {
          clearInterval(interval.current)
        }
      }, 100000)
    }
  }, [batchWrite, refetch])

  useEffect(() => {
    if (interval.current) {
      clearInterval(interval.current)
    }
  }, [balance, interval]);

  useEffect(() => {
    if (balance) setBalanceChanging(false)

  }, [balance])
  

  const handleFormChange = (index, event) => {
    let data = [...sendInputs];
    data[index][event.target.name] = event.target.value;
    setSendInputs(data);
  }

  const addFields = () => {
    let newfield = { recipient: address, amount: '1' };
    setSendInputs([...sendInputs, newfield]);
  }

  const removeFields = (index) => {
    let data = [...sendInputs];
    data.splice(index, 1);
    setSendInputs(data);
  }

  const submit = (e) => {
    e.preventDefault();
    console.log(sendInputs);
  }

  return (
      <Flex align={'center'} justify={'center'} mih={'100%'} direction={'column'} gap={'1rem'}>   
      
      {!batchWrite && (
          <Alert title="Notice" color="yellow" radius="md" withCloseButton>
            Multi-Send is not available with EoA
          </Alert>
      )}
        
      <Box maw={600} mx="auto">
        <form onSubmit={submit}>
          {sendInputs.map((input, index) => {
            return (
              <div key={index}>
                <Flex>
                  <TextInput
                    name='recipient'
                    label="Recipient"
                    placeholder='0x'
                    value={input.recipient}
                    onChange={event => handleFormChange(index, event)}
                  />
                  <TextInput
                    type="number"
                    name='amount'
                    label="Amount"
                    placeholder='0'
                    value={input.amount}
                    onChange={event => handleFormChange(index, event)}
                  />
                  <CloseButton onClick={() => removeFields(index)}>Remove</CloseButton>
                </Flex>
              </div>
            )
          })}
          <Button onClick={addFields}>Add More..</Button>

          <Group position="right" mt="md">
            <Button
              disabled={!batchWrite}
              loading={balanceChanging}
              size={'lg'}
              onClick={handleClick}
            >
              Send
            </Button>
          </Group>
        </form>
      </Box>
        
      </Flex>
  )
}

export function MintToken() {
  const { address } = useAccount();

  const [balanceChanging, setBalanceChanging] = useState(false);

  const [mintAmount, setMintAmount] = useState<number | undefined>(0);

  const { config } = usePrepareContractWrite({
    address: testTokenAddress,
    abi: contractAbi,
    functionName: "mint",
    args: [address, ethers.utils.parseUnits(mintAmount?.toString() || '0', testTokenDecimals)],
    enabled: true
  });
  const { write: mint } = useContractWrite(config);

  const { data: balance = 0, refetch } = useContractRead({
    address: testTokenAddress,
    abi: contractAbi,
    functionName: "balanceOf",
    args: [address],
  });

  useEffect(() => {
    if (balance) {
      setBalanceChanging(false)
    }
  }, [balance])

  const interval = useRef<any>()

  const handleClick = useCallback(() => {
    if (mint) {
      setBalanceChanging(true)
      mint()

      interval.current = setInterval(() => {
        refetch()
      }, 1000)
      setTimeout(() => {
        if (interval.current) {
          clearInterval(interval.current)
        }
      }, 100000)
    }
  }, [mint, refetch])

  return (
    <div>
      <NumberInput value={mintAmount} onChange={setMintAmount}/>
      <Button
        loading={balanceChanging}
        size={'lg'}
        onClick={handleClick}
      >
        Mint Token
      </Button>
    </div>
  )
}

export function TransferExample({ label = undefined }) {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { data: balance = 0 } = useContractRead({
    address: testTokenAddress,
    abi: contractAbi,
    functionName: "balanceOf",
    args: [address],
  });

  return (
    <Page title={"ERC-20"} description={description} docs={"https://docs.zerodev.app/use-wallets/pay-gas-for-users"}>
      <Flex align={'center'} justify={'center'} direction={'column'} gap={'1rem'} style={{ flex: 1 }}>
        <strong style={{ fontSize: '1.5rem' }}>Balance: {ethers.utils.formatUnits(BigNumber.from(balance), testTokenDecimals) ?? 0} 6TEST</strong>
        {chain?.blockExplorers?.default.url && <Anchor href={`${chain?.blockExplorers?.default.url}/address/${address}`} target="_blank">View Account</Anchor>}
      </Flex>
      <hr/>
      <Flex align={'center'} justify={'center'} direction={'column'} gap={'1rem'} style={{ flex: 1 }}>
        <MintToken/>
      </Flex>
      <hr/>
      <Flex align={'center'} justify={'center'} direction={'column'} gap={'1rem'} style={{ flex: 1 }}>
        <SendBatch/>        
      </Flex>
    </Page>
  );
}
