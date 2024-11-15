import React, { useState, useRef, useEffect, useContext } from "react";
import "../styles/SchemeRegistration.css";
import "../styles/SchemeCashReceipt.css";

import headeLogo from "../assets/images/shersoftnavLogo.png";
import saveImg from "../assets/images/SaveImage.png";
import printImg from "../assets/images/Printer.png";
import clearImg from "../assets/images/Document.png";
import findImg from "../assets/images/search.png";
import editImg from "../assets/images/Editing.png";
import deleteImg from "../assets/images/Delete.png";
import exitImg from "../assets/images/Exit1.png";
import playandpause from "../assets/images/Play and pause button.png";
import leftarrow from "../assets/images/Play button arrowhead left.png";
import rightarrow from "../assets/images/Play button arrowhead right.png";
import playandpauseRight from "../assets/images/Play and pause button right.png";
import toggleClose from "../assets/images/xred.webp";
import close from "../assets/images/findclose.png";
import binImg from "../assets/images/Bin.png";

//import ComboBox from "shersoft-combov1";
import ComboBox from "./ComboBox";
import axios from "axios";
import Swal from "sweetalert2";
import Print from "./Print";
import { AuthContext } from "../context/AuthContext";
import { useDbContext } from "../context/DbContext";

function SchemeCashReceipt({ onClose, formId, formName }) {
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  const { dbCode } = useDbContext();

  const { agentCode } = useContext(AuthContext);
  const [frmId, setfrmid] = useState("");
  const [fname, setfname] = useState("");

  useEffect(() => {
    setfrmid(formId);
    setfname(formName);
  }, [formId, formName]);
  // ////console.log("frmId===", frmId);

  const agentCodeRef = useRef(agentCode);

  useEffect(() => {
    agentCodeRef.current = agentCode;
  }, [agentCode]);

  const [userType, setuserType] = useState("");

  useEffect(() => {
    const storeduType = sessionStorage.getItem("userType");
    if (storeduType) {
      setuserType(storeduType);
    }
  }, []);

  const [showPrintModel, setShowPrintModel] = useState(false);

  const [printData, setPrintData] = useState(null);

  const handleClosePrint = () => {
    setShowPrintModel(false);
  };
  const [startDate, setStartDate] = useState(new Date());
  /////////////table///////////
  const tableContainerRef = useRef(null);
  const cashaccref = useRef(null);

  const entryNoInputRef = useRef(null);
  const cashaccinputRef = useRef(null);
  const rateInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const saveButtonRef = useRef(null);
  const editButtonRef = useRef(null);

  const addRow = () => {
    // ////console.log("add row called");
    setTableData([...tableData, {}]);
  };

  const [editDisabled, setEditDisabled] = useState(true);
  const [deleteDisabled, setDeleteDisabled] = useState(true);
  const [saveDisabled, setSaveDisabled] = useState(false);

  const handleScroll = () => {
    const tableContainer = tableContainerRef.current;
    if (
      tableContainer.scrollTop + tableContainer.clientHeight >=
      tableContainer.scrollHeight - 1
    ) {
      // User has scrolled to the bottom, add new rows
      addRow();
    }
  };

  //////////current date///////////

  const getCurrentDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  ////////////////////////// form data states //////////

  const [tableData, setTableData] = useState([
    ...Array(14).fill({
      SINo: "",
      name: "",
      agent: "",
      accountNumber: "",
      amount: "",
      gm: "",
      narration: "",
      printgm: "",
    }),
  ]);

  const openPrintModal = () => {
    fetchData();
    const slnoLimit = handleCheckSlno();
    if (selectedSlNo > slnoLimit || selectedSlNo <= 0) {
      alert("Enter SlNo Correctly");
      return;
    }

    setPrintData({
      tableData: tableData,
      schemeRecInfoData: schemeRecInfoData,
      index: selectedSlNo,
    });
    setShowPrintModel(true);
  };
  // ////console.log("table data ===== ", tableData);

  const [schemeRecInfoData, setschemeRecInfoData] = useState({
    EntryNo: "",
    cashAcc: "",
    rate: "",
    date: getCurrentDate(),
    totalamt: 0,
    totalgm: 0,
    agCode: parseInt(frmId ? frmId : agentCode),
  });
  // ////console.log("info data = ", schemeRecInfoData);

  ///////////////////////////////////////////////
  // const[accountTransaction,setAccountTransaction]=useState({
  // atDate:"",
  // atLedcode:"",
  // atType:"",
  // atEntryNo:"",
  // atAmount:"",
  // atNarration:"",

  //})

  ///////////////////////////////////////////////

  const handleCellChange = (event, rowIndex, field) => {
    // fetchAccNoData(event, rowIndex, agentCode);

    if (rowIndex > 0 && rowIndex % 2 === 0) {
      const newData = [...tableData]; // Create a copy of the tableData array
      newData[rowIndex - rowIndex / 2] = {
        ...newData[rowIndex - rowIndex / 2],
        [field]: event,
      }; // Update the value of the specified field in the row
      setTableData(newData); // Update the tableData state with the modified data
    } else {
      const newData = [...tableData]; // Create a copy of the tableData array
      newData[rowIndex] = { ...newData[rowIndex], [field]: event }; // Update the value of the specified field in the row
      setTableData(newData); // Update the tableData state with the modified data
    }
  };

  // const handleCellChangeinput = (event, rowIndex, field) => {

  //     const newData = [...tableData]; // Create a copy of the tableData array
  //     newData[rowIndex] = { ...newData[rowIndex], [field]: event.target.value }; // Update the value of the specified field in the row
  //     setTableData(newData); // Update the tableData state with the modified data

  // };
  const calculateGmvalue = (amount, index) => {
    if (amount !== "" || null) {
      const Rate = schemeRecInfoData.rate;
      //  ////console.log("log rate", Rate);
      if (Rate !== 0) {
        const calcgm = (amount / Rate).toFixed(3);
        handleCellChange(calcgm, index, "gm");
      }
    } else {
      handleCellChange("", index, "gm");
    }
  };

  const checkNameExists = (e) => {
    if (e.key === "Enter" || e.key === "Return") {
      if (!cnameData.find((item) => item[1] === e.target.value)) {
        alert("account not registered");
      }
    }
  };

  const checkAccnoExists = (e) => {
    if (e.key === "Enter" || e.key === "Return") {
      if (!accNo.find((item) => item[1] === e.target.value)) {
        alert("Account number not registered");
      }
    }
  };
  const checkledgerExists = (e) => {
    if (e.key === "Enter" || e.key === "Return") {
      if (!selectcashAcc.find((item) => item[1] === e.target.value)) {
        alert("Account does not Exist");
      }
    }
  };

  const handleCellChangeinput = (event, rowIndex, field) => {
    const newData = [...tableData]; // Create a copy of the tableData array

    if (rowIndex > 0 && rowIndex % 2 === 0) {
      if (field === "printgm") {
        newData[rowIndex - rowIndex / 2] = {
          ...newData[rowIndex - rowIndex / 2],
          [field]: event.target.checked ? 1 : 0, // If checkbox is checked, set value to 1, otherwise 0
        };
      } else {
        newData[rowIndex - rowIndex / 2] = {
          ...newData[rowIndex - rowIndex / 2],
          [field]: event.target.value,
        }; // Update the value of the specified field in the row
      }
      newData[rowIndex - rowIndex / 2] = {
        ...newData[rowIndex - rowIndex / 2],
        SINo: rowIndex / 2 + 1,
      }; // Update the SINo for the row
      setTableData(newData); // Update the tableData state with the modified data
    } else {
      if (field === "printgm") {
        newData[rowIndex] = {
          ...newData[rowIndex],
          [field]: event.target.checked ? 1 : 0, // If checkbox is checked, set value to 1, otherwise 0
        };
      } else {
        newData[rowIndex] = {
          ...newData[rowIndex],
          [field]: event.target.value,
        }; // Update the value of the specified field in the row
      }
      newData[rowIndex] = { ...newData[rowIndex], SINo: rowIndex / 2 + 1 }; // Update the SINo for the row
      setTableData(newData); // Update the tableData state with the modified data
    }
  };

  useEffect(() => {
    entryNoInputRef.current.focus();
  }, []);

  const handleKeyDown = (event, nextInputRef) => {
    if (event.key === "Enter" || event.key === "Return") {
      nextInputRef.current.focus();
    }
  };
  const [RowIndex, setRowIndex] = useState(0);
  // ////console.log(RowIndex);

  const handleKeyDownTable = (event, rowIndex, columnIndex) => {
    if (event.key === "Enter" || event.key === "Return") {
      event.preventDefault();

      const tableContainer = tableContainerRef.current;
      const rows = tableContainer.querySelectorAll(
        ".schRecDataTableBodyStyletr"
      );

      // Check if the row at the specified index exists
      if (rows[rowIndex]) {
        // Determine the next column index
        const nextColumnIndex =
          columnIndex < rows[rowIndex].cells.length - 1 ? columnIndex + 1 : 0;

        // Find the input field in the next column
        const nextInput =
          rows[rowIndex]?.cells[nextColumnIndex]?.querySelector("input");

        if (nextInput) {
          // Check if the current input field is the product name input field
          const currentInputAccno = columnIndex === 3;

          if (currentInputAccno && !event.target.value.trim()) {
            // If the product name input is empty, move focus to other charges input

            if (saveDisabled) {
              // If save button is disabled, move focus to edit button
              editButtonRef.current.focus();
            } else {
              // If save button is enabled, move focus to save button
              saveButtonRef.current.focus();
            }
          } else {
            // Otherwise, move focus to the next input field

            nextInput.focus();
          }
        }
      }
    }

    setRowIndex(rowIndex);
  };

  /////////////////////////////////////////////

  useEffect(() => {
    const fetchSchEntryno = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/main/SchRec_entryno/${parseInt(
            formId ? formId : agentCode
          )}/${dbCode}`
        );
        // ////console.log("response =", response);
        const schemeRecentryNo = response.data.map((item) => item[""]);

        setschemeRecInfoData((prevData) => ({
          ...prevData,
          EntryNo: schemeRecentryNo[0],
        }));
        // setSchEntryNo(schemeentryNo[0] );
      } catch (error) {
        console.error("Error fetching entry no:", error.message);
      }
    };

    fetchSchEntryno();
  }, [apiBaseUrl, formId]);

  const fetchSchEntryno = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/SchRec_entryno/${parseInt(
          frmId ? frmId : agentCode
        )}/${dbCode}`
      );
      // ////console.log("response =", response);
      const schemeRecentryNo = response.data.map((item) => item[""]);

      setschemeRecInfoData((prevData) => ({
        ...prevData,
        EntryNo: schemeRecentryNo[0],
      }));
      // setSchEntryNo(schemeentryNo[0] );
    } catch (error) {
      console.error("Error fetching entry no:", error.message);
    }
  };

  /////customer name //////

  const [cnameData, setCnameData] = useState([]);
  // ////console.log("cnamedata=====", cnameData);
  ///const [cnameAuto, setCNameAuto] = useState({});

  // const [purchasecashorsuppl, setpurchasecashorsuppl] = useState([]);

  // const [supplierName, setsupplierName] = useState([]);

  useEffect(() => {
    const fetchCname = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/main/SchRec_Cname/${dbCode}`
        );

        // Assuming response.data is an array with objects and each object has a LedName property
        const cName = response.data;

        // Transforming the array into the desired format
        // const supplName = cName.map((item) => item.LedName);

        const transformedData = cName.map((item) => [
          item.Ledcode,
          item.LedName,
        ]);
        setCnameData(transformedData);

        // setsupplierName(supplName);
      } catch (error) {
        console.error("Error fetching cashorsuppl Values:", error.message);
      }
    };

    fetchCname();
  }, [apiBaseUrl]);

  // ////console.log('cnameData=', cnameData);

  // useEffect(() => {
  //   const fetchCname = async () => {
  //     try {
  //       const response = await axios.get(`${apiBaseUrl}/main/SchRec_Cname`);
  //       setCnameData(response.data);

  //       // ////console.log("11111", response.data);
  //     } catch (error) {
  //       console.error("Error fetching cname data:", error.message);
  //     }
  //   };

  //   fetchCname();
  // }, [apiBaseUrl]);

  //////////agent name///////////////

  const [agentName, setagentName] = useState([]);
  const [agentobj, setAgentObj] = useState([]);

  useEffect(() => {
    const fetchAgname = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/main/schsalesmanNames/${dbCode}`
        );

        // Assuming response.data is an array with objects and each object has a LedName property
        const AgName = response.data;

        // Transforming the array into the desired format
        // const supplName = cName.map((item) => item.LedName);

        const transformedData = AgName.map((item) => [item.Auto, item.Name]);
        setagentName(transformedData);

        // setsupplierName(supplName);
      } catch (error) {
        console.error("Error fetching agent Values:", error.message);
      }
    };

    fetchAgname();
  }, [apiBaseUrl]);

  // useEffect(() => {
  //   const fetchAgname = async () => {
  //     try {
  //       const response = await axios.get(`${apiBaseUrl}/main/salesmanNames`);
  //       // setagentName(response.data);
  //       // setagentName(response.data.map((item) => item.Name));

  //       setAgentObj(response.data);
  //     } catch (error) {
  //       console.error("Error fetching Agname data:", error.message);
  //     }
  //   };

  //   fetchAgname();
  // }, [apiBaseUrl]);

  // ////console.log("......", agentobj);

  // const agentAutoValue = agentobj.find(item => item.Name === selectedName)?.Auto || '';

  // // Update the state with the corresponding Auto value
  // setComboId(agentAutoValue);
  //////acc no////////////

  const [accNo, setaccNo] = useState([]);
  // ////console.log('......',accnoAuto);

  useEffect(() => {
    const fetchAccno = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/main/SchRec_Accno/${dbCode}`
        );

        // Assuming response.data is an array with objects and each object has a LedName property
        const Accno = response.data;

        // Transforming the array into the desired format
        // const supplName = cName.map((item) => item.LedName);

        const transformedData = Accno.map((item) => [item.auto, item.accno]);
        setaccNo(transformedData);

        // setsupplierName(supplName);
      } catch (error) {
        console.error("Error fetching accno Values:", error.message);
      }
    };

    fetchAccno();
  }, [apiBaseUrl]);

  // useEffect(() => {
  //   const fetchAccno = async () => {
  //     try {
  //       const response = await axios.get(`${apiBaseUrl}/main/SchRec_Accno`);
  //       // setaccNo(response.data);
  //       setaccNo(response.data);
  //     } catch (error) {
  //       console.error("Error fetching Accno data:", error.message);
  //     }
  //   };

  //   fetchAccno();
  // }, [apiBaseUrl]);

  const [selectcashAcc, setselectcashAcc] = useState([]);
  // ////console.log("selectcashAcc", selectcashAcc);

  useEffect(() => {
    const selectcashAcc = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/main/SchRec_caba/${dbCode}`);

        // Assuming response.data is an array with objects and each object has a LedName property
        const caba = response.data;

        // Transforming the array into the desired format
        // const supplName = cName.map((item) => item.LedName);

        const transformedData = caba.map((item) => [
          item.ledcode,
          item.LedName,
        ]);
        setselectcashAcc(transformedData);

        if (userType === "EMPLOYEE") {
          ////console.log("function called");

          fetchcashAcc(transformedData);
        }

        // setsupplierName(supplName);
      } catch (error) {
        console.error("Error fetching selectcashAcc Values:", error.message);
      }
    };
    selectcashAcc();
  }, [apiBaseUrl, userType]);

  const Selectcashacc = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/main/SchRec_caba/${dbCode}`);

      // Assuming response.data is an array with objects and each object has a LedName property
      const caba = response.data;

      // Transforming the array into the desired format
      // const supplName = cName.map((item) => item.LedName);

      const transformedData = caba.map((item) => [item.ledcode, item.LedName]);
      setselectcashAcc(transformedData);
      if (userType === "EMPLOYEE") {
        ////console.log("function called");

        fetchcashAcc(transformedData);
      }

      // setsupplierName(supplName);
    } catch (error) {
      console.error("Error fetching selectcashAcc Values:", error.message);
    }
  };

  // useEffect(() => {
  //   Selectcashacc();

  const fetchcashAcc = async (data) => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/fetchcashacc/${parseInt(
          frmId ? frmId : agentCode
        )}/${dbCode}`
      );
      const caba = response.data[0];
      // ////console.log("agentcode,==", parseInt(agentCode));

      // ////console.log("caba===", caba.cashAcc);

      setschemeRecInfoData((prevState) => ({
        ...prevState,
        cashAcc: data.find((item) => item[0] === parseInt(caba.cashAcc)),
      }));
      // ////console.log(
      //   "acc=",
      //   data.find((item) => item[0] === parseInt(caba.cashAcc))
      // );
    } catch (error) {
      console.error("Error fetching Accno data:", error.message);
    }
  };

  // fetchcashAcc()

  // }, [apiBaseUrl,agentCode]);

  ///////////////////current rate //////////////////////////////

  useEffect(() => {
    const fetchSchCurrentRate = async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/main/currentgoldRate/${dbCode}`
        );
        const currentrate = response.data[0]?.currentRate;
        setschemeRecInfoData((prevData) => ({
          ...prevData,
          rate: currentrate,
        }));
      } catch (error) {
        console.error("Error fetching names Values:", error.message);
      }
    };

    fetchSchCurrentRate();
  }, [apiBaseUrl]);
  const fetchSchCurrentRate = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/currentgoldRate/${dbCode}`
      );
      const currentrate = response.data[0]?.currentRate;
      setschemeRecInfoData((prevData) => ({ ...prevData, rate: currentrate }));
    } catch (error) {
      console.error("Error fetching names Values:", error.message);
    }
  };

  ////////////////total calculations/////////////////////////////

  useEffect(() => {
    let totalAmount = 0;
    let totalGm = 0;
    tableData.forEach((rowData) => {
      totalAmount += parseFloat(rowData.amount || 0);
      totalGm += parseFloat(rowData.gm || 0);
    });
    setschemeRecInfoData((prevState) => ({
      ...prevState,
      totalamt: totalAmount.toFixed(3), // Update total amount
      totalgm: totalGm.toFixed(3), // Update total gm
    }));
  }, [tableData]);

  ////////////////////

  const [comboValue, setComboValue] = useState("");
  const handleClearCombo = () => {
    setComboValue("");
  };
  ///////////////////////////////////clear/////////////////////////////

  const handleClear = () => {
    fetchSchEntryno();
    fetchSchCurrentRate();
    Selectcashacc();
    setdispWt("");
    setschemeRecInfoData({
      cashAcc: "",

      date: getCurrentDate(),
      totalamt: "",
      totalgm: "",
    });

    setTableData([
      ...Array(14).fill({
        SINo: "",
        name: "",
        agent: "",
        accountNumber: "",
        amount: "",
        gm: "",
        narration: "",
        printgm: "",
      }),
    ]);

    entryNoInputRef.current.focus();
    setRowIndex(0);
    setEditDisabled(true);
    setDeleteDisabled(true);
    setSaveDisabled(false);
    // const [editDisabled, setEditDisabled] = useState(true);
    // const [deleteDisabled, setDeleteDisabled] = useState(true);
    // const [saveDisabled, setSaveDisabled] = useState(false);
  };

  const handleClearfind = () => {
    // fetchSchEntryno();
    // fetchSchCurrentRate();
    // setschemeRecInfoData({
    //   cashAcc: "",

    //   date: getCurrentDate(),
    //   totalamt: "",
    //   totalgm: "",
    // });

    setTableData([
      ...Array(14).fill({
        SINo: "",
        name: "",
        agent: "",
        accountNumber: "",
        amount: "",
        gm: "",
        narration: "",
        printgm: "",
      }),
    ]);

    entryNoInputRef.current.focus();
    setRowIndex(0);
    setEditDisabled(true);
    setDeleteDisabled(true);
    setSaveDisabled(false);
    // const [editDisabled, setEditDisabled] = useState(true);
    // const [deleteDisabled, setDeleteDisabled] = useState(true);
    // const [saveDisabled, setSaveDisabled] = useState(false);
  };
  ////////////////////////////////////////////////////////

  const fetchsmssettings = async (eName) => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/selectapidatas/${dbCode}/${eName}`
      );

      const smsData = response.data[0];
      console.log("smsData=", smsData);

      return smsData;
    } catch (error) {
      console.error("Error fetching smssettings Values:", error.message);
    }
  };

  const sendSMS = async (
    accountNo,
    mobileNo,
    customerName,
    total,
    grandTotal,
    netwt,
    gm
  ) => {
    const apiData = await fetchsmssettings("RECEIPT");
    console.log("apiData=", apiData);


    // Replace placeholders in the MessageBody with actual values
    const message = apiData.MessageBody.replace("${accountNo}", accountNo)
      .replace("${customerName}", customerName)
      .replace("${total}", total)
      .replace("${grandTotal}", grandTotal)
      .replace("${netwt}", netwt)
      .replace("${gm}", gm);

    // const message = `Account No.:${accountNo} NAME:${customerName} Amount:${total} Total:${grandTotal} Weight:${gm}gm Total weight:${netwt}gm Thank you CHUNDANGATHRA GOLD AND DIAMONDS`;

    // const url = `http://sapteleservices.com/SMS_API/sendsms.php`;
    const params = {
      username: "chundangathra",
      password: "81ed95",
      mobile: mobileNo,
      sendername: "CHUJWL",
      message: message,
      routetype: "1",
      tid: "1607100000000318300",
    };

    // try {
    //   const response = await axios.get(url, { params });
    //   return response.data;
    // } catch (error) {
    //   console.error(`Error sending SMS to ${mobileNo}:`, error.message);
    //   return null;
    // }

    // const url = `http://sapteleservices.com/SMS_API/sendsms.php?username=chundangathra&password=81ed95&mobile=${mobileNo}&sendername=CHUJWL&message=${encodeURIComponent(
    //   message
    // )}&routetype=1&tid=1607100000000318300`;
    const url = apiData.ApiLink.replace("${mobileNo}", mobileNo).replace(
      "${encodeURIComponent(message)}",
      encodeURIComponent(message)
    );

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error sending SMS to ${mobileNo}:`, error.message);
      return null;
    }
  };

  const handleSave = async () => {
    setSaveDisabled(true);

    try {
      if (!schemeRecInfoData.cashAcc) {
        // If cashAcc is not filled, display an alert and return without saving
        alert("Enter Data  Correctly.");
        setSaveDisabled(false);

        return;
      }

      const hasData = tableData.some((row) => {
        return (
          row.name &&
          row.agent &&
          row.accountNumber &&
          row.amount &&
          Object.values(row).some((value) => value !== "")
        );
      });

      if (!hasData) {
        // If no data is entered, display an alert and return without saving
        alert("Enter Data  Correctly.");
        setSaveDisabled(false);

        return;
      }

      const filteredTableData = tableData.filter((row) => {
        // Check if any of the fields in the row is not empty
        return Object.values(row).some((value) => value !== "");
      });

      const transformedTableData = filteredTableData.map((row) => ({
        SINo: row.SINo || null,
        name: row.name[0] || null, // Access the second item of the name array
        agent: row.agent[0] || null, // Access the second item of the agent array
        accountNumber: row.accountNumber[0] || null, // Access the second item of the accountNumber array
        amount: row.amount || null,
        gm: row.gm || null,
        narration: row.narration || null,
        printgm: row.printgm || null,
      }));
      // ////console.log("transformedTableData", transformedTableData);
      const response = await axios.post(`${apiBaseUrl}/main/saveSchRec/${dbCode}`, {
        statementType: "SchRec_insert",
        cashacc: schemeRecInfoData.cashAcc[0],
        rate: schemeRecInfoData.rate,
        date: schemeRecInfoData.date,
        totalamount: schemeRecInfoData.totalamt,
        totalgm: schemeRecInfoData.totalgm,
        agCode: parseInt(frmId ? frmId : agentCode),

        type: transformedTableData, // Pass the entire tableData array
      });

      if (response.data.success) {
        const accountNumbers = transformedTableData.map(
          (row) => row.accountNumber
        );
        const mobileNumbersResponse = await axios.post(
          `${apiBaseUrl}/main/fetchMobileNos/${dbCode}`,
          {
            accountNumbers,
          }
        );

        if (mobileNumbersResponse.data) {
          // ////console.log("Mobile Numbers:", mobileNumbersResponse.data);

          // Send SMS to each mobile number
          mobileNumbersResponse.data.forEach(async (mobileNumber) => {
            // ////console.log(transformedTableData);
            // ////console.log(mobileNumber);
            const customerData = transformedTableData.find(
              (row) => row.name === mobileNumber.accname
            );
            // ////console.log("customerData==", customerData);

            if (customerData) {
              const total = customerData.amount;
              const netwt = mobileNumber.totalWt;
              const grandTotal = mobileNumber.totalAmt;
              const gm = customerData.gm;
              // const smsResponse = await sendSMS(
              //   accNo.find((item) => item[0] === customerData.accountNumber)[1],
              //   mobileNumber.mobileNo,
              //   cnameData.find((item) => item[0] === mobileNumber.accname)[1],
              //   total,
              //   grandTotal,
              //   netwt,
              //   gm
              // );

              // ////console.log(`SMS sent to ${mobileNumber.mobileNo}:`, smsResponse);
            }
          });
        }

        handleClear();
        //  Swal.fire("Success", "Data saved successfully!", "success");
        alert("Entry Saved");
        // Optionally, you can perform additional actions after successful save
      } else {
        // Swal.fire("Error", "Failed to save data!", "error");
        alert("Failed to save data!");
        setSaveDisabled(false);
      }
    } catch (error) {
      console.error("Error saving data:", error.message);
      //  Swal.fire("Error", "Internal server error!", "error");
      alert("Internal server error!");
      setSaveDisabled(false);
    }
    handleClear();
  };

  const handleEdit = async () => {
    try {
      if (!schemeRecInfoData.cashAcc) {
        // If cashAcc is not filled, display an alert and return without saving
        alert("Enter Data  Correctly.");
        return;
      }

      const hasData = tableData.some((row) => {
        return (
          row.name &&
          row.agent &&
          row.accountNumber &&
          row.amount &&
          Object.values(row).some((value) => value !== "")
        );
      });

      if (!hasData) {
        // If no data is entered, display an alert and return without saving
        alert("Enter Data  Correctly.");
        return;
      }

      const filteredTableData = tableData.filter((row) => {
        // Check if any of the fields in the row is not empty
        return Object.values(row).some((value) => value !== "");
      });

      const transformedTableData = filteredTableData.map((row) => ({
        SINo: row.SINo || null,
        name: row.name[0] || null, // Access the second item of the name array
        agent: row.agent[0] || null, // Access the second item of the agent array
        accountNumber: row.accountNumber[0] || null, // Access the second item of the accountNumber array
        amount: row.amount || null,
        gm: row.gm || null,
        narration: row.narration || null,
        printgm: row.printgm || null,
      }));
      //////console.log("transformedTableData", transformedTableData);
      const response = await axios.post(
        `${apiBaseUrl}/main/updateSchRec/${dbCode}`,
        {
          statementType: "SchRec_insert",
          cashacc: schemeRecInfoData.cashAcc[0],
          rate: schemeRecInfoData.rate,
          date: schemeRecInfoData.date,
          totalamount: schemeRecInfoData.totalamt,
          totalgm: schemeRecInfoData.totalgm,
          agCode: parseInt(frmId ? frmId : agentCode),

          EntryNo: schemeRecInfoData.EntryNo,
          type: transformedTableData, // Pass the entire tableData array
        }
      );

      if (response.data.success) {
        const accountNumbers = transformedTableData.map(
          (row) => row.accountNumber
        );
        const mobileNumbersResponse = await axios.post(
          `${apiBaseUrl}/main/fetchMobileNos/${dbCode}`,
          {
            accountNumbers,
          }
        );

        if (mobileNumbersResponse.data) {
          // ////console.log("Mobile Numbers:", mobileNumbersResponse.data);

          // Send SMS to each mobile number
          mobileNumbersResponse.data.forEach(async (mobileNumber) => {
            const customerData = transformedTableData.find(
              (row) => row.accountNumber[0] === mobileNumber.accountNumber
            );

            if (customerData) {
              const grandTotal = customerData.amount;
              const netwt = mobileNumber.totalWt;
              const total = mobileNumber.totalAmt;
              const gm = customerData.gm;
              // const smsResponse = await sendSMS(
              //   accNo.find((item) => item[0] === customerData.accountNumber),
              //   mobileNumber.mobileNo,
              //   cnameData.find((item) => item[0] === mobileNumber.accname),
              //   grandTotal,
              //   total,
              //   netwt,
              //   gm
              // );

              // ////console.log(`SMS sent to ${mobileNumber.mobileNo}:`, smsResponse);
            }
          });
        }
        //   handleClear();
        // Swal.fire("Success", "Data Edit successfully!", "success");
        alert("Entry Edited");
        // Optionally, you can perform additional actions after successful save
        entryNoInputRef.current.focus();
      } else {
        // Swal.fire("Error", "Failed to edit data!", "error");
        alert("Failed to edit data!");
      }
    } catch (error) {
      console.error("Error edit data:", error.message);
      // Swal.fire("Error", "Internal server error!", "error");
      alert("Internal server error!");
    }
    // handleClear();
  };

  const getDisplayValue = (value) => {
    if (Array.isArray(value) && value.length > 0) {
      return value[0];
    }
    return "";
  };

  //////console.log("datra",tableData[0].accountNumber);

  const [accNoData, setAccNoData] = useState([]);
  // ////console.log("accNoData===", accNoData);
  // const fetchAccNoData = async (e, rowIndex, agCode) => {
  //   try {
  //     const response = await axios.get(
  //       `${apiBaseUrl}/main/findbyaccnotable/${e[1]}`
  //     );
  //     const fetchedData = response.data;
  //     const newData = [...tableData];

  //     // Check if fetched data exists and is in the correct format
  //     if (Array.isArray(fetchedData) && fetchedData.length > 0) {
  //       const { accname, agent } = fetchedData[0]; // Assuming only one record is fetched

  //       // Find the corresponding array in cnameData based on accname
  //       const matchingCnameData = cnameData.find((item) => item[0] === accname);

  //       // Find the corresponding array in agentName based on agent
  //       const matchingAgentData = agentName.find(
  //         (item) => item[0] === parseInt(agentCode)
  //       );

  //       // Update the name and agent fields of the current row in tableData
  //       if (rowIndex > 0 && rowIndex % 2 === 0) {
  //         newData[rowIndex - rowIndex / 2] = {
  //           ...newData[rowIndex - rowIndex / 2],
  //           name: matchingCnameData || [], // Store the matching array from cnameData or an empty array
  //           agent: matchingAgentData || [], // Store the matching array from agentName or an empty array
  //           accountNumber: e,
  //         };
  //       } else {
  //         newData[rowIndex] = {
  //           ...newData[rowIndex],
  //           name: matchingCnameData || [], // Store the matching array from cnameData or an empty array
  //           agent: matchingAgentData || [], // Store the matching array from agentName or an empty array
  //           accountNumber: e,
  //         };
  //       }
  //       setTableData(newData);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error.message);
  //   }
  // };

  const fetchAccNoData = async (e, rowIndex, agCode) => {
    try {
      // ////console.log("eeeee====",e.target.value);

      const response = await axios.get(
        `${apiBaseUrl}/main/findbyaccnotable/${e.target.value}/${dbCode}`
      );
      const fetchedData = response.data;
      const newData = [...tableData];

      // Check if fetched data exists and is in the correct format
      if (Array.isArray(fetchedData) && fetchedData.length > 0) {
        const { accname, agent } = fetchedData[0]; // Assuming only one record is fetched

        // Find the corresponding array in cnameData based on accname
        const matchingCnameData = cnameData.find((item) => item[0] === accname);

        // Find the corresponding array in agentName based on agent
        const matchingAgentData = agentName.find(
          (item) => item[0] === parseInt(frmId ? frmId : agentCode)
        );

        // Update the name and agent fields of the current row in tableData
        if (rowIndex > 0 && rowIndex % 2 === 0) {
          newData[rowIndex - rowIndex / 2] = {
            ...newData[rowIndex - rowIndex / 2],
            name: matchingCnameData || [], // Store the matching array from cnameData or an empty array
            agent: matchingAgentData || [], // Store the matching array from agentName or an empty array
            accountNumber: accNo.find((item) => item[1] === e.target.value),
          };
          // dispTotalWt(rowIndex % 2 === 0 ? rowIndex / 2 + 1 : "",matchingCnameData[0] || [])
        } else {
          newData[rowIndex] = {
            ...newData[rowIndex],
            name: matchingCnameData || [], // Store the matching array from cnameData or an empty array
            agent: matchingAgentData || [], // Store the matching array from agentName or an empty array
            accountNumber: accNo.find((item) => item[1] === e.target.value),
          };
          // dispTotalWt(rowIndex % 2 === 0 ? rowIndex / 2 + 1 : "",matchingCnameData[0] || [])
        }
        setTableData(newData);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const [showFindDialog, setShowFindDialog] = useState(false); // State for controlling the visibility of the find dialog
  const [findEntryNo, setFindEntryNo] = useState(""); // State to store the entry number entered in the find dialog
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [selectedSlNo, setSelectedSlno] = useState("");

  // ////console.log(findEntryNo);
  const openFindDialog = () => {
    setShowFindDialog(true);
  };

  const closeFindDialog = () => {
    setShowFindDialog(false);
    setFindEntryNo("");
  };

  const openPrintDialog = () => {
    setShowPrintDialog(true);
  };

  const closePrintDialog = () => {
    setShowPrintDialog(false);
  };
  // const handleFind = () => {

  //   ////console.log("Finding entry number:", findEntryNo);
  //   closeFindDialog();
  // };
  const [firstEno, setFirstEno] = useState("");
  const [lastEno, setLastEno] = useState("");
  //////console.log(firstEno,lastEno);

  const fetchfirstandlast = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/topandlast/${parseInt(
          frmId ? frmId : agentCode
        )}/${dbCode}`
      );
      if (response.status === 200) {
        setFirstEno(response.data[0].firstentryno);
        setLastEno(response.data[0].lastentryno);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };
  // ////console.log('accNo==',accNo);
  // ////console.log('accccc=',accNo.find((item) => item[0] === 10));

  const handleFindbyentrynumber = async () => {
    handleClearfind();
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/SchRecfindbyentryNo/${findEntryNo}/${parseInt(
          frmId ? frmId : agentCode
        )}/${dbCode}`
      );

      if (response.status === 200) {
        const foundData = response.data;
        // ////console.log(foundData);
        //  ////console.log("data =", foundData);
        const newData = foundData.map((row) => ({
          //  SINo: row.Srp_entryno,
          name: cnameData.find((item) => item[0] === row.Srp_name),
          agent: agentName.find((item) => item[0] === row.Srp_agent),
          accountNumber: accNo.find((item) => item[0] === row.Srp_accountno),
          amount: row.Srp_amount, // You might need to adjust this based on your requirements
          gm: row.Srp_gm, // You might need to adjust this based on your requirements
          narration: row.Srp_narration, // You might need to adjust this based on your requirements
          printgm: row.Srp_printgm, // You might need to adjust this based on your requirements
        }));

        const firstRowData = foundData[0]; // Assuming SrInfo data is the same for all rows
        setschemeRecInfoData({
          ...schemeRecInfoData,
          EntryNo: firstRowData.SrInfo_entryno,
          cashAcc: selectcashAcc.find(
            (item) => item[0] === firstRowData.SrInfo_cashaccount
          ),
          rate: firstRowData.SrInfo_rate,
          date: formatDate(firstRowData.SrInfo_date),
          totalamt: firstRowData.SrInfo_totalamount,
          totalgm: firstRowData.SrInfo_totalgm,
        });
        // sr_AppEnable:foundData.Address1 || foundData,

        // Add the new data to tableData
        // Add the new data to tableData
        setTableData((prevTableData) => [...newData, ...prevTableData]);

        setEditDisabled(false);
        setDeleteDisabled(false);
        setSaveDisabled(true);
      } else {
        console.error("Error finding data:", response.data);
      }
    } catch (error) {
      console.error("Error:", error.message);
      //setDataFound(false);
    }
    closeFindDialog();
  };
  function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  // ////console.log('formatted date',formatDate);

  const handleDelete = async () => {
    if (!window.confirm("Do You Want To Delete..?")) {
      return;
    }
    try {
      const response = await axios.delete(
        `${apiBaseUrl}/main/deleterecbyentryno/${
          schemeRecInfoData.EntryNo
        }/${parseInt(frmId ? frmId : agentCode)}/${dbCode}`
      );
      if (response.status === 200) {
        // Swal.fire({
        //   position: "top-end",
        //   icon: "success",
        //   title: "Scheme deleted",
        //   showConfirmButton: false,
        //   timer: 2000,
        // });
        alert("Entry Deleted Successfully!");
        // window.location.reload();
        handleClear();
      } else {
        console.error("Error deleting data:", response.data);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  const handleFindprev = async (e) => {
    fetchfirstandlast();
    if (schemeRecInfoData.EntryNo > firstEno) {
      handleClearfind();
    }
    // else{
    //   return;
    // }
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/SchRecfindprev/${schemeRecInfoData.EntryNo}/${parseInt(
          frmId ? frmId : agentCode
        )}/${dbCode}`
      );

      //  ////console.log("response=",response.data);

      if (response.status === 200) {
        const foundData = response.data;

        //////console.log("data =", foundData);
        const newData = foundData.map((row) => ({
          //  SINo: row.Srp_entryno,
          name: cnameData.find((item) => item[0] === row.Srp_name),
          agent: agentName.find((item) => item[0] === row.Srp_agent),
          accountNumber: accNo.find((item) => item[0] === row.Srp_accountno),
          amount: row.Srp_amount, // You might need to adjust this based on your requirements
          gm: row.Srp_gm, // You might need to adjust this based on your requirements
          narration: row.Srp_narration, // You might need to adjust this based on your requirements
          printgm: row.Srp_printgm, // You might need to adjust this based on your requirements
        }));

        const firstRowData = foundData[0]; // Assuming SrInfo data is the same for all rows
        setschemeRecInfoData({
          ...schemeRecInfoData,
          EntryNo: firstRowData.SrInfo_entryno,
          cashAcc: selectcashAcc.find(
            (item) => item[0] === firstRowData.SrInfo_cashaccount
          ),
          rate: firstRowData.SrInfo_rate,
          date: formatDate(firstRowData.SrInfo_date),
          totalamt: firstRowData.SrInfo_totalamount,
          totalgm: firstRowData.SrInfo_totalgm,
        });
        // sr_AppEnable:foundData.Address1 || foundData,

        // Add the new data to tableData
        // Add the new data to tableData
        setTableData((prevTableData) => [...newData, ...prevTableData]);

        setEditDisabled(false);
        setDeleteDisabled(false);
        setSaveDisabled(true);
      } else {
        console.error("Error finding data:", response.data);
      }
    } catch (error) {
      console.error("Error:", error.message);
      //setDataFound(false);
    }
    closeFindDialog();
  };
  const handleFindnext = async () => {
    fetchfirstandlast();
    if (schemeRecInfoData.EntryNo < lastEno) {
      handleClearfind();
    }

    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/SchRecfindnext/${schemeRecInfoData.EntryNo}/${parseInt(
          frmId ? frmId : agentCode
        )}/${dbCode}`
      );

      if (response.status === 200) {
        const foundData = response.data;
        // ////console.log("data =", foundData);
        const newData = foundData.map((row) => ({
          //  SINo: row.Srp_entryno,
          name: cnameData.find((item) => item[0] === row.Srp_name),
          agent: agentName.find((item) => item[0] === row.Srp_agent),
          accountNumber: accNo.find((item) => item[0] === row.Srp_accountno),
          amount: row.Srp_amount, // You might need to adjust this based on your requirements
          gm: row.Srp_gm, // You might need to adjust this based on your requirements
          narration: row.Srp_narration, // You might need to adjust this based on your requirements
          printgm: row.Srp_printgm,
        }));

        const firstRowData = foundData[0]; // Assuming SrInfo data is the same for all rows
        setschemeRecInfoData({
          ...schemeRecInfoData,
          EntryNo: firstRowData.SrInfo_entryno,
          cashAcc: selectcashAcc.find(
            (item) => item[0] === firstRowData.SrInfo_cashaccount
          ),
          rate: firstRowData.SrInfo_rate,
          date: formatDate(firstRowData.SrInfo_date),
          totalamt: firstRowData.SrInfo_totalamount,
          totalgm: firstRowData.SrInfo_totalgm,
        });
        // sr_AppEnable:foundData.Address1 || foundData,

        // Add the new data to tableData
        // Add the new data to tableData
        setTableData((prevTableData) => [...newData, ...prevTableData]);

        setEditDisabled(false);
        setDeleteDisabled(false);
        setSaveDisabled(true);
      } else {
        console.error("Error finding data:", response.data);
      }
    } catch (error) {
      console.error("Error:", error.message);
      //setDataFound(false);
    }
    closeFindDialog();
  };

  const handleFindfirst = async () => {
    handleClearfind();
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/SchRecfindfirst/${schemeRecInfoData.EntryNo}/${parseInt(
          frmId ? frmId : agentCode
        )}/${dbCode}`
      );

      if (response.status === 200) {
        const foundData = response.data;
        // ////console.log("data =", foundData);
        const newData = foundData.map((row) => ({
          //  SINo: row.Srp_entryno,
          name: cnameData.find((item) => item[0] === row.Srp_name),
          agent: agentName.find((item) => item[0] === row.Srp_agent),
          accountNumber: accNo.find((item) => item[0] === row.Srp_accountno),
          amount: row.Srp_amount, // You might need to adjust this based on your requirements
          gm: row.Srp_gm, // You might need to adjust this based on your requirements
          narration: row.Srp_narration, // You might need to adjust this based on your requirements
          printgm: row.Srp_printgm, // You might need to adjust this based on your requirements
        }));

        const firstRowData = foundData[0]; // Assuming SrInfo data is the same for all rows
        setschemeRecInfoData({
          ...schemeRecInfoData,
          EntryNo: firstRowData.SrInfo_entryno,
          cashAcc: selectcashAcc.find(
            (item) => item[0] === firstRowData.SrInfo_cashaccount
          ),
          rate: firstRowData.SrInfo_rate,
          date: formatDate(firstRowData.SrInfo_date),
          totalamt: firstRowData.SrInfo_totalamount,
          totalgm: firstRowData.SrInfo_totalgm,
        });
        // sr_AppEnable:foundData.Address1 || foundData,

        // Add the new data to tableData
        // Add the new data to tableData
        setTableData((prevTableData) => [...newData, ...prevTableData]);

        setEditDisabled(false);
        setDeleteDisabled(false);
        setSaveDisabled(true);
      } else {
        console.error("Error finding data:", response.data);
      }
    } catch (error) {
      console.error("Error:", error.message);
      //setDataFound(false);
    }
    closeFindDialog();
  };

  const handleFindlast = async () => {
    handleClearfind();
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/SchRecfindlast/${schemeRecInfoData.EntryNo}/${parseInt(
          frmId ? frmId : agentCode
        )}/${dbCode}`
      );

      if (response.status === 200) {
        const foundData = response.data;
        // ////console.log("data =", foundData);
        const newData = foundData.map((row) => ({
          //  SINo: row.Srp_entryno,
          name: cnameData.find((item) => item[0] === row.Srp_name),
          agent: agentName.find((item) => item[0] === row.Srp_agent),
          accountNumber: accNo.find((item) => item[0] === row.Srp_accountno),
          amount: row.Srp_amount, // You might need to adjust this based on your requirements
          gm: row.Srp_gm, // You might need to adjust this based on your requirements
          narration: row.Srp_narration, // You might need to adjust this based on your requirements
          printgm: row.Srp_printgm, // You might need to adjust this based on your requirements
        }));

        const firstRowData = foundData[0]; // Assuming SrInfo data is the same for all rows
        setschemeRecInfoData({
          ...schemeRecInfoData,
          EntryNo: firstRowData.SrInfo_entryno,
          cashAcc: selectcashAcc.find(
            (item) => item[0] === firstRowData.SrInfo_cashaccount
          ),
          rate: firstRowData.SrInfo_rate,
          date: formatDate(firstRowData.SrInfo_date),
          totalamt: firstRowData.SrInfo_totalamount,
          totalgm: firstRowData.SrInfo_totalgm,
        });
        // sr_AppEnable:foundData.Address1 || foundData,

        // Add the new data to tableData
        // Add the new data to tableData
        setTableData((prevTableData) => [...newData, ...prevTableData]);

        setEditDisabled(false);
        setDeleteDisabled(false);
        setSaveDisabled(true);
      } else {
        console.error("Error finding data:", response.data);
      }
    } catch (error) {
      console.error("Error:", error.message);
      //setDataFound(false);
    }
    closeFindDialog();
  };
  const handleCheckSlno = () => {
    const filteredTableData = tableData.filter((row) => {
      // Check if any of the fields in the row is not empty
      return Object.values(row).some((value) => value !== "");
    });
    const filteredTableDataLength = filteredTableData.length;
    return filteredTableDataLength;
  };

  const [accumulatedWt, setaccumulatedWt] = useState("");
  // ////console.log("accumulatedWt",accumulatedWt);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/totalweight/${
          tableData[selectedSlNo - 1 || 0].name[0]
        }/${dbCode}`
      );
      //////console.log("res===",response.data);
      setaccumulatedWt(response.data[0].WeightDifference);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const [dispWt, setdispWt] = useState("");

  // const dispTotalWt = async (index,e) => {
  //   // ////console.log("index===",index);
  // //   if(e.key==='Enter'||e.key==='Return')
  // //  {
  //    try {
  //     const response = await axios.get(
  //       // `${apiBaseUrl}/main/totalweight/${tableData[index - 1 || 0].name[0]}`
  //       `${apiBaseUrl}/main/totalweight/${e}`

  //     );
  //     var calcgm =0;
  //     // if (e.target.value !== "" || null) {
  //     //   const Rate = schemeRecInfoData.rate;
  //     //   //  ////console.log("log rate", Rate);
  //     //   if (Rate !== 0) {
  //     //      calcgm = (e.target.value / Rate).toFixed(3);
  //     //     //  ////console.log("calcgm===",calcgm);

  //     //   }

  //     // }
  //     // const totalWeight = parseFloat(response.data[0].WeightDifference||0) + parseFloat(calcgm);

  //     setdispWt(response.data[0].WeightDifference||0);
  //     // setdispWt(totalWeight.toFixed(3));

  //     // ////console.log("res===",response.data[0].WeightDifference);
  //     // ////console.log("parse=", parseFloat(response.data[0].WeightDifference));

  //     // ////console.log("wt===",calcgm);
  //     // ////console.log("parse2", parseFloat(calcgm));

  //     // ////console.log("totalgm=",dispWt);

  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //   }
  // // }
  // //   else{
  // //     return
  // //   }
  // };

  const dispTotalWt = async (index, e) => {
    // ////console.log("index===",index);
    //   if(e.key==='Enter'||e.key==='Return')
    //  {
    try {
      const response = await axios.get(
        `${apiBaseUrl}/main/totalweight/${
          tableData[index - 1 || 0].name[0]
        }/${dbCode}`
        // `${apiBaseUrl}/main/totalweight/${e}`
      );
      var calcgm = 0;
      if (e.target.value !== "" || null) {
        const Rate = schemeRecInfoData.rate;
        //  ////console.log("log rate", Rate);
        if (Rate !== 0) {
          calcgm = (e.target.value / Rate).toFixed(3);
          //  ////console.log("calcgm===",calcgm);
        }
      }
      const totalWeight =
        parseFloat(response.data[0].WeightDifference || 0) + parseFloat(calcgm);

      // setdispWt(response.data[0].WeightDifference||0);
      setdispWt(totalWeight.toFixed(3));

      // ////console.log("res===",response.data[0].WeightDifference);
      // ////console.log("parse=", parseFloat(response.data[0].WeightDifference));

      // ////console.log("wt===",calcgm);
      // ////console.log("parse2", parseFloat(calcgm));

      // ////console.log("totalgm=",dispWt);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    // }
    //   else{
    //     return
    //   }
  };

  const removeRow = (index) => {
    const newTableData = [...tableData];
    newTableData.splice(index, 1);
    setTableData(newTableData);
  };

  return (
    // <div className="regmodal-overlay">
    <div className="regmodal schemeRec">
      <div className="schemecontrolls">
        {/* ///////// */}
        <div className="schemereg_headerLogo_Div">
          <div className="schemereg_headerLogo" onClick={handleCheckSlno}>
            <img src={headeLogo} alt="SherSoftLogo" />
          </div>
          <label className="schemeReg_pageHead">
            {" "}
            {fname ? fname : "Scheme Receipt"}
          </label>
        </div>
        <img
          alt="X"
          src={toggleClose}
          className="close-icon"
          onClick={onClose}
        />
      </div>

      {/*............................ Navbar.............................................. */}
      <div className="schemeReg_navbar">
        <button
          style={{
            border: "none",
            backgroundColor: "transparent",
            marginLeft: "2%",
          }}
          className={`schemeNav_items `}
          ref={saveButtonRef}
          onClick={handleSave}
          // disabled={dataFound}
          disabled={saveDisabled}
        >
          <div className="schemeReg_buttonImage">
            <img src={saveImg} alt="SaveImg" />
          </div>
          Save
        </button>
        <button
          style={{ border: "none", backgroundColor: "transparent" }}
          className="schemeNav_items"
          onClick={openPrintDialog}
        >
          <div className="schemeReg_buttonImage">
            <img src={printImg} alt="PrintImg" />
          </div>
          Print
        </button>
        <button
          style={{ border: "none", backgroundColor: "transparent" }}
          className="schemeNav_items"
          onClick={handleClear}
        >
          <div className="schemeReg_buttonImage">
            <img src={clearImg} alt="clearImg" />
          </div>
          Clear
        </button>
        <button
          style={{ border: "none", backgroundColor: "transparent" }}
          className="schemeNav_items"
          // onClick={handleFind}
          onClick={openFindDialog}
        >
          <div className="schemeReg_buttonImage">
            <img src={findImg} alt="findImg" />
          </div>
          Find
        </button>
        <button
          ref={editButtonRef}
          style={{ border: "none", backgroundColor: "transparent" }}
          className={`schemeNav_items }`}
          onClick={handleEdit}
          // disabled={!dataFound}
          disabled={editDisabled}
        >
          <div className="schemeReg_buttonImage">
            <img src={editImg} alt="editImg" />
          </div>
          Edit
        </button>
        <button
          style={{ border: "none", backgroundColor: "transparent" }}
          className={`schemeNav_items `}
          onClick={handleDelete}
          // disabled={!dataFound}
          disabled={deleteDisabled}
        >
          <div className="schemeReg_buttonImage">
            <img src={deleteImg} alt="deleteImg" />
          </div>
          Delete
        </button>
        <button
          style={{ border: "none", backgroundColor: "transparent" }}
          className="schemeNav_items"
          onClick={() => {
            onClose();
            setfrmid("");
            setfname("");
          }}
        >
          <div className="schemeReg_buttonImage">
            <img src={exitImg} alt="exitImg" />
          </div>
          Exit
        </button>

        {/* ////////// */}
        <div className="schemeReg_arrowButtons">
          <button
            style={{ backgroundColor: "transparent" }}
            className="schemeReg_arrowButtonImage"
            onClick={(e) => {
              handleFindfirst(e);
            }}
          >
            <img src={playandpause} alt="playandpause" />
          </button>
          <button
            style={{ backgroundColor: "transparent" }}
            className="schemeReg_arrowButtonImage"
            onClick={(e) => {
              handleFindprev(e);
            }}
          >
            <img src={leftarrow} alt="leftarrow" />
          </button>
          <button
            style={{ backgroundColor: "transparent" }}
            className="schemeReg_arrowButtonImage"
            onClick={(e) => {
              handleFindnext(e);
            }}
          >
            <img src={rightarrow} alt="rightarrow" />
          </button>
          <button
            style={{ backgroundColor: "transparent", marginRight: "2%" }}
            className="schemeReg_arrowButtonImage"
            onClick={(e) => {
              handleFindlast(e);
            }}
          >
            <img src={playandpauseRight} alt="playandpauseRight" />
          </button>
        </div>
      </div>
      {/*............................ NavbarEnd.............................................. */}

      <div className="schemeRecBody">
        <div className="schemeRecBodyData">
          <div className="schRecTopdata">
            <div className="schRecTopdatasections schRecsec1">
              <div className="schRecTopdatasectionsrows">
                <label>Entry No</label>
                <input
                  ref={entryNoInputRef}
                  readOnly
                  style={{ textAlign: "center" }}
                  value={schemeRecInfoData.EntryNo}
                  onKeyDown={(e) => handleKeyDown(e, cashaccinputRef)}
                  onChange={(e) =>
                    setschemeRecInfoData({
                      ...schemeRecInfoData,
                      EntryNo: e.target.value,
                    })
                  }
                />
              </div>
              <div className="schRecTopdatasectionsrows"></div>
            </div>
            <div className="schRecTopdatasections schRecsec2">
              <div className="schRecTopdatasectionsrows sec2row">
                <label>Select Cash Account</label>
                <ComboBox
                  //    findedValue={schemeRecInfoData.cashAcc[0]}
                  findedValue={
                    Array.isArray(schemeRecInfoData.cashAcc)
                      ? schemeRecInfoData.cashAcc[1]
                      : schemeRecInfoData.cashAcc
                  }
                  comboRef={cashaccinputRef}
                  options={selectcashAcc}
                  className="cashaccCombo"
                  inputClassName="cashaccComboinput"
                  onKeyDown={(e) => {
                    handleKeyDown(e, rateInputRef);
                    checkledgerExists(e);
                  }}
                  onInputChange={(e) =>
                    setschemeRecInfoData({ ...schemeRecInfoData, cashAcc: e })
                  }
                  readOnly={userType === "EMPLOYEE" ? true : false}
                />
              </div>
              <div className="schRecTopdatasectionsrows sec2row">
                <label>Rate</label>
                <input
                  value={schemeRecInfoData.rate}
                  type="number"
                  ref={rateInputRef}
                  style={{ width: "45%", textAlign: "right" }}
                  onKeyDown={(e) => handleKeyDown(e, dateInputRef)}
                  onChange={(e) =>
                    setschemeRecInfoData({
                      ...schemeRecInfoData,
                      rate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="schRecTopdatasections  schRecSec3">
              <div
                className="schRecTopdatasectionsrows sec3row"
                style={{ width: "14vw" }}
              >
                <label >Date</label>
                <input
                  value={schemeRecInfoData.date}
                  type="date"
                  ref={dateInputRef}
                  onKeyDown={(e) => handleKeyDownTable(e, RowIndex, 2)}
                  onChange={(e) =>
                    setschemeRecInfoData({
                      ...schemeRecInfoData,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              {/* <div
                className="schRecTopdatasectionsrows sec3row"
                style={{ backgroundColor: "blue" }}
              >
                
              </div> */}
            </div>
          </div>

          {/*---------------- receipt data table.----------------------- */}

          <div
            className="schRecDataTable"
            onScroll={handleScroll}
            ref={tableContainerRef}
          >
            <table>
              <thead className="schRecDataTableHead">
                <tr>
                  <th className="schRecDataTableHeadslno">SI No</th>
                  <th className="schRecDataTableHeadname">Name</th>
                  <th className="schRecDataTableHeadagent">Agent</th>
                  <th className="schRecDataTableHeadaccno">Account Number</th>
                  <th className="schRecDataTableHeadamount">Amount</th>
                  <th className="schRecDataTableHeadgm">Gm</th>
                  <th className="schRecDataTableHeadnarration">Narration</th>
                  <th className="schRecDataTableHeadprintgm">Print Gm</th>
                  <th className="schRecDataTableHeadprintgm"></th>
                </tr>
              </thead>
              <tbody className="schRecDataTableBodyStyle">
                {tableData.map((rowData, rowIndex) => (
                  <tr
                    key={rowIndex}
                    style={{
                      background:
                        rowIndex % 2 === 1 ? "#EBEBEB" : "transparent",
                    }}
                    className="schRecDataTableBodyStyletr"
                  >
                    <td
                      className="schRecDataTableDataBoxSlno"
                      style={{ textAlign: "center" }}
                    >
                      {rowIndex % 2 === 0 ? rowIndex / 2 + 1 : ""}
                    </td>

                    <td className="schRecDataTableDataBoxname">
                      {" "}
                      {rowIndex % 2 === 0 && (
                        <ComboBox
                          // findedValue={

                          //       tableData[  rowIndex > 0 && rowIndex % 2 === 0
                          //         ? rowIndex - rowIndex / 2
                          //         : rowIndex]
                          // }

                          // tableData[
                          //   rowIndex > 0 && rowIndex % 2 === 0
                          //     ? rowIndex - rowIndex / 2
                          //     : rowIndex
                          // ]["name"][0]

                          // findedValue={

                          //   tableData[rowIndex > 0 && rowIndex % 2 === 0 ? rowIndex - rowIndex / 2 : rowIndex]?.name?.[1] ?? ''
                          // }
                          /*here because of the empty lines betwwen the rows of the table ,while saving the data to the state there is an empty rows storing. 
                          there for i am changing the row index values according to the row index.
                          if the row index is odd that means it is an empty row so i stores that to the prevoius index. */

                          findedValue={
                            Array.isArray(
                              tableData[
                                rowIndex > 0 && rowIndex % 2 === 0
                                  ? rowIndex - rowIndex / 2
                                  : rowIndex
                              ]?.name
                            )
                              ? tableData[
                                  rowIndex > 0 && rowIndex % 2 === 0
                                    ? rowIndex - rowIndex / 2
                                    : rowIndex
                                ]?.name?.[1] ?? ""
                              : tableData[
                                  rowIndex > 0 && rowIndex % 2 === 0
                                    ? rowIndex - rowIndex / 2
                                    : rowIndex
                                ]?.name
                          }
                          options={cnameData}
                          className="schRecDataTableDataBox test"
                          inputClassName="dataBox"
                          comboRef={(ref) => `combo_${rowIndex}`}
                          onKeyDown={(e) => {
                            handleKeyDownTable(e, rowIndex, 1);
                            checkNameExists(e);
                          }}
                          onInputChange={(e) => {
                            handleCellChange(e, rowIndex, "name");

                            // handleNameSelection(
                            //   e,
                            //   rowIndex > 0 && rowIndex % 2 === 0
                            //     ? rowIndex - rowIndex / 2
                            //     : rowIndex
                            // );
                          }}
                        />
                      )}
                    </td>

                    <td className="schRecDataTableDataBoxagent">
                      {rowIndex % 2 === 0 && (
                        <ComboBox
                          // Use the actual field value from tableData
                          // findedValue={
                          //   tableData[
                          //     rowIndex > 0 && rowIndex % 2 === 0
                          //       ? rowIndex - rowIndex / 2
                          //       : rowIndex
                          //   ]["agent"]
                          // }
                          // tableData[
                          //   rowIndex > 0 && rowIndex % 2 === 0
                          //     ? rowIndex - rowIndex / 2
                          //     : rowIndex
                          // ]["agent"][0]

                          // ............................

                          // findedValue={

                          //   tableData[
                          //     rowIndex > 0 && rowIndex % 2 === 0
                          //       ? rowIndex - rowIndex / 2
                          //       : rowIndex
                          //   ]?.agent?.[1] ?? ""
                          // }

                          findedValue={
                            Array.isArray(
                              tableData[
                                rowIndex > 0 && rowIndex % 2 === 0
                                  ? rowIndex - rowIndex / 2
                                  : rowIndex
                              ]?.agent
                            )
                              ? tableData[
                                  rowIndex > 0 && rowIndex % 2 === 0
                                    ? rowIndex - rowIndex / 2
                                    : rowIndex
                                ]?.agent?.[1] ?? ""
                              : tableData[
                                  rowIndex > 0 && rowIndex % 2 === 0
                                    ? rowIndex - rowIndex / 2
                                    : rowIndex
                                ]?.agent
                          }
                          options={agentName}
                          className="schRecDataTableDataBox test"
                          inputClassName="dataBox"
                          comboRef={(ref) => `combo_${rowIndex}`}
                          onKeyDown={(e) => handleKeyDownTable(e, rowIndex, 2)}
                          onInputChange={
                            (e) => handleCellChange(e, rowIndex, "agent")

                            // handleAgentNameSelection(
                            //   e,
                            //   rowIndex > 0 && rowIndex % 2 === 0
                            //     ? rowIndex - rowIndex / 2
                            //     : rowIndex
                            // )
                          }
                          readOnly={true}
                        />
                      )}
                    </td>

                    {/* // tableData[
                            //   rowIndex > 0 && rowIndex % 2 === 0
                            //     ? rowIndex - rowIndex / 2
                            //     : rowIndex
                            // ]["accountNumber"][0] */}

                    <td className="schRecDataTableDataBoxaccno">
                      {" "}
                      {rowIndex % 2 === 0 && (
                        <ComboBox
                          // findedValue={

                          //   tableData[
                          //     rowIndex > 0 && rowIndex % 2 === 0
                          //       ? rowIndex - rowIndex / 2
                          //       : rowIndex
                          //   ]?.accountNumber?.[1] ?? ""
                          // }
                          findedValue={
                            Array.isArray(
                              tableData[
                                rowIndex > 0 && rowIndex % 2 === 0
                                  ? rowIndex - rowIndex / 2
                                  : rowIndex
                              ]?.accountNumber
                            )
                              ? tableData[
                                  rowIndex > 0 && rowIndex % 2 === 0
                                    ? rowIndex - rowIndex / 2
                                    : rowIndex
                                ]?.accountNumber?.[1] ?? ""
                              : tableData[
                                  rowIndex > 0 && rowIndex % 2 === 0
                                    ? rowIndex - rowIndex / 2
                                    : rowIndex
                                ]?.accountNumber
                          }
                          options={accNo}
                          className="schRecDataTableDataBox  test"
                          inputClassName="dataBox"
                          comboRef={(ref) => `combo_${rowIndex}`}
                          onKeyDown={(e) => {
                            handleKeyDownTable(e, rowIndex, 3);
                            //  fetchAccNoData(e, rowIndex);
                            // checkAccnoExists(e)
                            // addRow();
                          }}
                          onInputChange={
                            (e) => {
                              handleCellChange(e, rowIndex, "accountNumber");
                            }
                            // handleAccounttNoSelection(
                            //   e,
                            //   rowIndex > 0 && rowIndex % 2 === 0
                            //     ? rowIndex - rowIndex / 2
                            //     : rowIndex
                            // )
                          }
                          onBlur={(e) =>
                            fetchAccNoData(
                              e,
                              rowIndex,
                              frmId ? frmId : agentCode
                            )
                          }
                          inlineStyles={{ textAlign: "right" }}
                        />
                      )}
                    </td>

                    <td className="schRecDataTableDataBoxamount">
                      {" "}
                      {rowIndex % 2 === 0 && (
                        <input
                          value={
                            tableData[
                              rowIndex > 0 && rowIndex % 2 === 0
                                ? rowIndex - rowIndex / 2
                                : rowIndex
                            ]["amount"]
                          }
                          style={{ textAlign: "right" }}
                          onChange={(e) => {
                            handleCellChangeinput(e, rowIndex, "amount");
                          }}
                          className="schRecDataTableDataBox textalignRight"
                          onKeyDown={(e) => {
                            handleKeyDownTable(e, rowIndex, 4);
                            // dispTotalWt(rowIndex % 2 === 0 ? rowIndex / 2 + 1 : "",e)
                          }}
                          onBlur={(e) => {
                            calculateGmvalue(e.target.value, rowIndex);
                            dispTotalWt(
                              rowIndex % 2 === 0 ? rowIndex / 2 + 1 : "",
                              e
                            );
                          }}
                        />
                      )}
                    </td>

                    <td className="schRecDataTableDataBoxGm">
                      {" "}
                      {rowIndex % 2 === 0 && (
                        <input
                          readOnly
                          value={
                            tableData[
                              rowIndex > 0 && rowIndex % 2 === 0
                                ? rowIndex - rowIndex / 2
                                : rowIndex
                            ]["gm"]
                          }
                          style={{ textAlign: "right" }}
                          className="schRecDataTableDataBox textalignRight"
                          onKeyDown={(e) => {
                            handleKeyDownTable(e, rowIndex, 5);
                          }}
                          onChange={(e) => {
                            handleCellChangeinput(e, rowIndex, "gm");
                          }}
                        />
                      )}
                    </td>

                    <td className="schRecDataTableDataBoxStonenarration">
                      {" "}
                      {rowIndex % 2 === 0 && (
                        <input
                          value={
                            tableData[
                              rowIndex > 0 && rowIndex % 2 === 0
                                ? rowIndex - rowIndex / 2
                                : rowIndex
                            ]["narration"]
                          }
                          className="schRecDataTableDataBox textalignRight"
                          onKeyDown={(e) => {
                            addRow();
                            handleKeyDownTable(e, rowIndex + 2, 2);
                          }}
                          onChange={(e) =>
                            handleCellChangeinput(e, rowIndex, "narration")
                          }
                        />
                      )}
                    </td>

                    <td className="schRecDataTableDataBoxprintgm">
                      {" "}
                      {rowIndex % 2 === 0 && (
                        <input
                          // value={
                          //   tableData[
                          //     rowIndex > 0 && rowIndex % 2 === 0
                          //       ? rowIndex - rowIndex / 2
                          //       : rowIndex
                          //   ]["printgm"]
                          // }
                          checked={
                            tableData[
                              rowIndex > 0 && rowIndex % 2 === 0
                                ? rowIndex - rowIndex / 2
                                : rowIndex
                            ]["printgm"] === 1
                          }
                          type="checkbox"
                          onChange={(e) =>
                            handleCellChangeinput(e, rowIndex, "printgm")
                          }
                          className="schRecDataTableDataBox textalignRight"
                        />
                      )}
                    </td>
                    <td
                      className="schRecDataTableDataBoxRemoveItem"
                      onClick={() =>
                        removeRow(rowIndex % 2 === 0 ? rowIndex / 2 : "")
                      }
                    >
                      {rowIndex % 2 === 0 && <img src={binImg} alt="binImg" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="schRecDataTablefootertotal">
            <div className="oldwt">
              <label>TW</label>
              <input value={dispWt} style={{ height: "80%", border: "none" }} />
            </div>

            <input
              className="schRecDataTablefootertotalamount"
              value={schemeRecInfoData.totalamt}
              style={{ textAlign: "right" }}
              onChange={(e) =>
                setschemeRecInfoData({
                  ...schemeRecInfoData,
                  totalamt: e.target.value,
                })
              }
            />

            <input
              className="schRecDataTablefootertotalGm"
              value={schemeRecInfoData.totalgm}
              style={{ textAlign: "right" }}
              onChange={(e) =>
                setschemeRecInfoData({
                  ...schemeRecInfoData,
                  totalgm: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      {showFindDialog && (
        <div className="find-dialog">
          <input
            type="text"
            value={findEntryNo}
            onChange={(e) => setFindEntryNo(e.target.value)}
            placeholder="Enter Entry No"
          />
          <button onClick={handleFindbyentrynumber}>Find</button>
          {/* <button
            onClick={() => {
              closeFindDialog();
              handleClear();
            }}
          >
            Cancel
          </button> */}
          <div
            className="findCloseDiv"
            onClick={() => {
              closeFindDialog();
              handleClear();
            }}
            style={{ border: "none", backgroundColor: "transparent" }}
          >
            <img
              src={close}
              alt="Close"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      )}

      {showPrintDialog && (
        <div className="find-dialog">
          <input
            type="text"
            // value={findEntryNo}
            onChange={(e) => setSelectedSlno(e.target.value)}
            placeholder="Enter Sl No"
          />
          <button onClick={openPrintModal}>Print</button>
          <div
            className="findCloseDiv"
            onClick={() => {
              closePrintDialog();
              handleClear();
            }}
            style={{ border: "none", backgroundColor: "transparent" }}
          >
            <img
              src={close}
              alt="Close"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      )}
      {showPrintModel && (
        <Print
          printData={printData}
          onClose={handleClosePrint}
          totalwt={accumulatedWt}
        />
      )}
    </div>
    // </div>
  );
}

export default SchemeCashReceipt;
