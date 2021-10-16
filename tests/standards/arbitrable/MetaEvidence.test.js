import Web3 from "web3";
import ganache from "ganache-core";
import nock from "nock";
import { _deplyTestArbitrableContract } from "../../utils.js";
import Arbitrable from "../../../src/standards/Arbitrable";
import { multihashFile } from "../../../src/utils/hashing";

const provider = ganache.provider();

describe("MetaEvidence", () => {
  let web3;
  let arbitrableInstance;
  let accounts;

  beforeAll(async () => {
    web3 = new Web3(provider);
    accounts = await web3.eth.getAccounts();
    arbitrableInstance = new Arbitrable(provider);
  });

  it("valid metaEvidence -- hash in uri", async () => {
    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
    };

    const hash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    const fakeHost = "http://fake-address";
    nock(fakeHost).get(`/${hash}`).reply(200, metaEvidenceJSON);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${hash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy();
    expect(metaEvidence.metaEvidenceJSON).toEqual(metaEvidenceJSON);
    expect(metaEvidence.blockNumber).toBeTruthy();
    expect(metaEvidence.transactionHash).toEqual(receipt.transactionHash);
  });
  it("invalid metaEvidence -- hash in uri", async () => {
    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
    };
    const hash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    const fakeHost = "http://fake-address";
    nock(fakeHost).get(`/${hash}`).reply(200, { title: "different metaEvidence" });
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${hash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);
    expect(metaEvidence.metaEvidenceJSONValid).toBeFalsy();
  });
  it("valid file -- hash in uri", async () => {
    const testFile = JSON.stringify({
      type: "file",
      data: "0x0",
    });
    const fileHash = multihashFile(testFile, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      fileURI: `${fakeHost}/${fileHash}`,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/${fileHash}`).reply(200, testFile);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy();
    expect(metaEvidence.fileValid).toBeTruthy();
  });
  it("invalid file -- hash in uri", async () => {
    const testFile = JSON.stringify({
      type: "file",
      data: "0x0",
    });
    const fileHash = multihashFile(testFile, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      fileURI: `${fakeHost}/${fileHash}`,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/${fileHash}`).reply(200, { type: null });
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy();
    expect(metaEvidence.fileValid).toBeFalsy();
  });
  it("valid file -- hash as fileHash", async () => {
    const testFile = JSON.stringify({
      type: "file",
      data: "0x0",
    });
    const fileHash = multihashFile(testFile, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      fileURI: `${fakeHost}/file`,
      fileHash,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/file`).reply(200, testFile);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy();
    expect(metaEvidence.fileValid).toBeTruthy();
  });
  it("invalid file -- hash as fileHash", async () => {
    const testFile = JSON.stringify({
      type: "file",
      data: "0x0",
    });
    const fileHash = multihashFile(testFile, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      fileURI: `${fakeHost}/file`,
      fileHash,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/file`).reply(200, { type: null });
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy();
    expect(metaEvidence.fileValid).toBeFalsy();
  });
  it("valid metaEvidence -- selfHash", async () => {
    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
    };
    const hash = multihashFile(metaEvidenceJSON, 0x1b);

    metaEvidenceJSON.selfHash = hash;

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    const fakeHost = "http://fake-address";
    nock(fakeHost).get(`/test`).reply(200, metaEvidenceJSON);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/test`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);
    expect(metaEvidence.metaEvidenceJSON.title).toEqual(metaEvidenceJSON.title);
    expect(metaEvidence.metaEvidenceJSON.description).toEqual(metaEvidenceJSON.description);
    expect(metaEvidence.metaEvidenceJSONValid).toBeTruthy();
  });
  it("invalid metaEvidence -- strict", async () => {
    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
    };
    const hash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    const fakeHost = "http://fake-address";
    nock(fakeHost).get(`/${hash}`).reply(200, { title: "different metaEvidence" });
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${hash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    let errored = false;
    try {
      await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, { strict: true });
    } catch (err) {
      expect(err).toBeTruthy();
      errored = true;
    }
    expect(errored).toBeTruthy();
  });

  it("invalid metaEvidence -- strict", async () => {
    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
    };
    const hash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    const fakeHost = "http://fake-address";
    nock(fakeHost).get(`/${hash}`).reply(200, { title: "different metaEvidence" });
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${hash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    let errored = false;
    try {
      await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, { strict: true });
    } catch (err) {
      expect(err).toBeTruthy();
      errored = true;
    }
    expect(errored).toBeTruthy();
  });

  it("invalid file -- deprecated strictHashes", async () => {
    const testFile = JSON.stringify({
      type: "file",
      data: "0x0",
    });
    const fileHash = multihashFile(testFile, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      fileURI: `${fakeHost}/${fileHash}`,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/${fileHash}`).reply(200, { type: null });
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    let errored = false;
    try {
      await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, { strictHashes: true });
    } catch (err) {
      expect(err).toBeTruthy();
      errored = true;
    }
    expect(errored).toBeTruthy();
  });

  it("valid arbitrable interface -- hash in filename", async () => {
    const testFile = JSON.stringify({
      type: "file",
      data: "0x0",
    });
    const fileHash = multihashFile(testFile, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      evidenceDisplayInterfaceURL: `${fakeHost}/${fileHash}`,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/${fileHash}`).reply(200, testFile);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);
    expect(metaEvidence.interfaceValid).toBeTruthy();
  });
  it("valid arbitrable interface -- hash in evidenceDisplayInterfaceHash", async () => {
    const testFile = JSON.stringify({
      type: "file",
      data: "0x0",
    });
    const fileHash = multihashFile(testFile, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      evidenceDisplayInterfaceURL: `${fakeHost}/test`,
      evidenceDisplayInterfaceHash: fileHash,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/test`).reply(200, testFile);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);
    expect(metaEvidence.interfaceValid).toBeTruthy();
  });
  it("invalid arbitrable interface", async () => {
    const testFile = JSON.stringify({
      type: "file",
      data: "0x0",
    });
    const fileHash = multihashFile(testFile, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      evidenceDisplayInterfaceURL: `${fakeHost}/test`,
      evidenceDisplayInterfaceHash: fileHash,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/test`).reply(200, { type: "other" });
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);
    expect(metaEvidence.interfaceValid).toBeFalsy();
  });

  it("edit metaEvidence with dynamicScriptURI", async () => {
    const testScript = 'const getMetaEvidence = () => {resolveScript({rulingOptions: {type: "multiple-select"}})};';
    const scriptHash = multihashFile(testScript, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      rulingOptions: {
        type: "single-select",
      },
      dynamicScriptURI: `${fakeHost}/${scriptHash}`,
      dynamicScriptHash: scriptHash,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/${scriptHash}`).reply(200, testScript);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, {
      scriptParameters: { param: "foo" },
    });

    expect(metaEvidence.scriptValid).toBeTruthy();
    expect(metaEvidence.metaEvidenceJSON.rulingOptions.type).toBe("multiple-select");
  });

  it("edit metaEvidence with dynamicScriptURI and injected parameters", async () => {
    const testScript =
      'const getMetaEvidence = () => {resolveScript({rulingOptions: {type: "multiple-select"}, param: scriptParameters.param})};';
    const scriptHash = multihashFile(testScript, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      rulingOptions: {
        type: "single-select",
      },
      dynamicScriptURI: `${fakeHost}/${scriptHash}`,
      dynamicScriptHash: scriptHash,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/${scriptHash}`).reply(200, testScript);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, {
      scriptParameters: { param: "foo" },
    });

    expect(metaEvidence.scriptValid).toBeTruthy();
    expect(metaEvidence.metaEvidenceJSON.rulingOptions.type).toBe("multiple-select");
    expect(metaEvidence.metaEvidenceJSON.param).toBe("foo");
  });

  it("script fail: should still return metaEvidence", async () => {
    const testScript =
      'const getMetaEvidence = () => {bad syntax; resolveScript({rulingOptions: {type: "multiple-select"}}});';
    const scriptHash = multihashFile(testScript, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      rulingOptions: {
        type: "single-select",
      },
      dynamicScriptURI: `${fakeHost}/${scriptHash}`,
      dynamicScriptHash: scriptHash,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/${scriptHash}`).reply(200, testScript);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);

    expect(metaEvidence.scriptValid).toBeFalsy();
    expect(metaEvidence.metaEvidenceJSON).toEqual(metaEvidenceJSON);
  });

  it("script reject: should still return metaEvidence", async () => {
    const testScript = 'const getMetaEvidence = () => {rejectScript(new Error("fail"));';
    const scriptHash = multihashFile(testScript, 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      rulingOptions: {
        type: "single-select",
      },
      dynamicScriptURI: `${fakeHost}/${scriptHash}`,
      dynamicScriptHash: scriptHash,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/${scriptHash}`).reply(200, testScript);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);

    expect(metaEvidence.scriptValid).toBeFalsy();
    expect(metaEvidence.metaEvidenceJSON).toEqual(metaEvidenceJSON);
  });

  it("script hash fail", async () => {
    const testScript = 'const getMetaEvidence = () => {resolveScript {rulingOptions: {type: "multiple-select"}}};';
    const scriptHash = multihashFile(testScript + ";;", 0x1b);

    const fakeHost = "http://fake-address";

    const metaEvidenceJSON = {
      title: "test title",
      description: "test description",
      rulingOptions: {
        type: "single",
      },
      dynamicScriptURI: `${fakeHost}/${scriptHash}`,
      dynamicScriptHash: scriptHash,
    };
    const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

    // deploy arbitrable contract to test with
    const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
    expect(arbitrableContract.options.address).toBeTruthy();

    nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
    nock(fakeHost).get(`/${scriptHash}`).reply(200, testScript);
    // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
    const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
      from: accounts[0],
      gas: 500000,
    });
    expect(receipt.transactionHash).toBeTruthy();

    const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);

    expect(metaEvidence.scriptValid).toBeFalsy();
    expect(metaEvidence.metaEvidenceJSON).toBeTruthy();
  });

  describe("Multiple chain support & injected parameters", () => {
    async function deployMetaEvidence(testScript, _metaEvidenceJSON) {
      const scriptHash = multihashFile(testScript, 0x1b);

      const fakeHost = "http://fake-address";

      const metaEvidenceJSON = {
        ..._metaEvidenceJSON,
        dynamicScriptURI: `${fakeHost}/${scriptHash}`,
        dynamicScriptHash: scriptHash,
      };
      const metaEvidenceHash = multihashFile(metaEvidenceJSON, 0x1b);

      // deploy arbitrable contract to test with
      const arbitrableContract = await _deplyTestArbitrableContract(provider, accounts[0]);
      expect(arbitrableContract.options.address).toBeTruthy();

      nock(fakeHost).get(`/${metaEvidenceHash}`).reply(200, metaEvidenceJSON);
      nock(fakeHost).get(`/${scriptHash}`).reply(200, testScript);
      // emit meta evidence with metaEvidenceID = 0 and evidence = fakeURI
      const receipt = await arbitrableContract.methods.emitMetaEvidence(0, `${fakeHost}/${metaEvidenceHash}`).send({
        from: accounts[0],
        gas: 500000,
      });
      expect(receipt.transactionHash).toBeTruthy();

      return arbitrableContract;
    }

    describe("when `arbitrableChainID` is hard-coded into meta evidence JSON", () => {
      it("should inject `arbitrableChainID` as a parameter for dynamic script even when its not provided in `scriptParameters`", async () => {
        const arbitrableChainID = 1;
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitrableChainID });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
          arbitrableChainID,
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);
        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);

        expect(metaEvidence.scriptValid).toBeTruthy();
        expect(metaEvidence.metaEvidenceJSON.param).toBe(arbitrableChainID);
      });

      it("should consider the meta evidence invalid when `arbitrableChainID` from the file is different from the one provided in `scriptParameters`", async () => {
        const arbitrableChainID = 1;
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitrableChainID });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
          arbitrableChainID,
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);
        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, {
          scriptParameters: { arbitrableChainID: 100 },
        });

        expect(metaEvidence.scriptValid).toBeFalsy();
      });

      it("should get the `arbitrableJsonRpcUrl` from `options.getJsonRpcUrl` and inject it into `scriptParameters`", async () => {
        const arbitrableChainID = 1;
        const fakeJsonRpcUrl = "dummy://url";
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitrableJsonRpcUrl });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
          arbitrableChainID,
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);
        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, {
          getJsonRpcUrl: () => fakeJsonRpcUrl,
        });

        expect(metaEvidence.scriptValid).toBeTruthy();
        expect(metaEvidence.metaEvidenceJSON.param).toBe(fakeJsonRpcUrl);
      });

      it("should get the `arbitrableJsonRpcUrl` from `scriptParameters.arbitratorJsonRpcUrl` when `metaEvidence.arbitrableChainID === scriptParameters.arbitratorChainID` and inject it into `scriptParameters`", async () => {
        const arbitrableChainID = 1;
        const fakeJsonRpcUrl = "dummy://url";
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitrableJsonRpcUrl });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
          arbitrableChainID,
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);
        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, {
          scriptParameters: {
            arbitratorChainID: 1,
            arbitratorJsonRpcUrl: fakeJsonRpcUrl,
          },
          getJsonRpcUrl: () => "dummy://yet-another-fake-url",
        });

        expect(metaEvidence.scriptValid).toBeTruthy();
        expect(metaEvidence.metaEvidenceJSON.param).toBe(fakeJsonRpcUrl);
      });
    });

    describe("when `arbitratorChainID` is hard-coded into meta evidence JSON", () => {
      it("should inject `arbitratorChainID` as a parameter for dynamic script even when its not provided in `scriptParameters`", async () => {
        const arbitratorChainID = 1;
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitratorChainID });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
          arbitratorChainID,
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);
        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);

        expect(metaEvidence.scriptValid).toBeTruthy();
        expect(metaEvidence.metaEvidenceJSON.param).toBe(arbitratorChainID);
      });

      it("should consider the meta evidence invalid when `arbitratorChainID` from the file is different from the one provided in `scriptParameters`", async () => {
        const arbitratorChainID = 1;
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitratorChainID });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
          arbitratorChainID,
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);
        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, {
          scriptParameters: { arbitratorChainID: 100 },
        });

        expect(metaEvidence.scriptValid).toBeFalsy();
      });
    });

    describe("when `arbitrableChainID` is missing from meta evidence JSON and not provided in `scriptParameters`", () => {
      it("should inject `arbitrableChainID` with the same value as `arbitratorChainID` when the latter is hard-coded into the meta evidence JSON", async () => {
        const arbitratorChainID = 1;
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitrableChainID });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
          arbitratorChainID,
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);
        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);

        expect(metaEvidence.scriptValid).toBeTruthy();
        expect(metaEvidence.metaEvidenceJSON.param).toBe(arbitratorChainID);
      });

      it("should inject `arbitrableChainID` with the same value as `arbitratorChainID` when the latter provided in `scriptParameters`", async () => {
        const arbitratorChainID = 1;
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitrableChainID });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);
        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, {
          scriptParameters: { arbitratorChainID },
        });

        expect(metaEvidence.scriptValid).toBeTruthy();
        expect(metaEvidence.metaEvidenceJSON.param).toBe(arbitratorChainID);
      });

      it("should not inject `arbitrableChainID` when `arbitratorChainID` is not hard-coded into meta evidence JSON neither provided in `scriptParameters`", async () => {
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitrableChainID });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);
        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);

        expect(metaEvidence.scriptValid).toBeTruthy();
        expect(metaEvidence.metaEvidenceJSON.param).toBe(undefined);
      });
    });

    describe("When `scriptParameters.arbitratorJsonRpcUrl` is not provided", () => {
      it("should to get arbitratorJsonRpcUrl from `options.getJsonRpcUrl` if provided", async () => {
        const arbitratorChainID = 1;
        const fakeUrl = "dummy://fake-url";
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitratorJsonRpcUrl });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
          arbitratorChainID,
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);

        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0, {
          getJsonRpcUrl: () => fakeUrl,
        });

        expect(metaEvidence.scriptValid).toBeTruthy();
        expect(metaEvidence.metaEvidenceJSON.param).toBe(fakeUrl);
      });
    });

    describe("When `scriptParameters.arbitrableContractAddress` is not provided", () => {
      it("should inject `contractAddresss` as `scriptParameters.arbitratorAddress`", async () => {
        const testScript =
          "const getMetaEvidence = () => {resolveScript({ param: scriptParameters.arbitrableContractAddress });}";
        const metaEvidenceJSON = {
          title: "test title",
          description: "test description",
          rulingOptions: {
            type: "single-select",
          },
        };

        const arbitrableContract = await deployMetaEvidence(testScript, metaEvidenceJSON);

        const metaEvidence = await arbitrableInstance.getMetaEvidence(arbitrableContract.options.address, 0);

        expect(metaEvidence.scriptValid).toBeTruthy();
        expect(metaEvidence.metaEvidenceJSON.param).toBe(arbitrableContract.options.address);
      });
    });
  });
});
