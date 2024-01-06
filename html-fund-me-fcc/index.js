import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fund")
connectButton.onclick = connect
fundButton.onclick = fund

async function connect() {
    if (typeof window.ethereum != "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected"
    } else {
        connectButton.innerHTML = "Please install metamask!"
    }
}

async function fund() {
    const ethAmount = "77"
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum != "undefined") {
        // provider / connection to the blockchain
        // signer / wallet / someone with some gas
        // Contract that we are interacting with
        // ^ ABI & Contract Address
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    return new Promise((resolve, reject) => {
       try {
           provider.once(transactionResponse.hash, (transactionReceipt) => {
               console.log(
                   `Completed with ${transactionReceipt.confirmations} confirmations. `,
               )
               resolve()
           })
       } catch (error) {
           reject(error)
       }
    })
}
