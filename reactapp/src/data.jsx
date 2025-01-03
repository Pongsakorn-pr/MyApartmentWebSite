import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Alert } from 'react-bootstrap';
import { PencilSquare, Trash, Printer, HouseAdd } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

const DataPage = () => {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [count, setCount] = useState(0);
    const navigate = useNavigate();
    const [tempData, setDatatmp] = useState([]);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = (item) => {
        setDatatmp(item);
        setShow(true);
    };
    const downloadPdf = async (item) => {
        var requestRowIndex = {
            rowIndex: item.bill_id
        };
        axios.post('https://webapiforproperly.azurewebsites.net/api/Apartment/PdfBill', requestRowIndex, {
            responseType: 'blob' // Important to handle binary data (PDF)
        })
            .then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                const link = document.createElement('a');
                var filename = item.month + '_' + item.year + '_Bill_' + item.room_number + '.pdf';
                link.href = url;
                link.setAttribute('download', filename); // Set the file name
                document.body.appendChild(link);
                link.click();
            })
            .catch(error => {
                console.error('Error generating PDF:', error);
            });
    };
    const deleteData = async (item) => {
        try {
            // Use the actual ID of the item
            var id = item.bill_id + 1;
           await axios.delete(`https://webapiforproperly.azurewebsites.net/api/Apartment/${id}`);
            navigate('/');
        } catch (error) {
            console.error("Error deleting data:", error);
            // Display an error message to the user 
        }
    };
    const NavAddData = (count) => {
        navigate('/AddData', { state: {data : count } });
    }
    const handleEdit = (item) => {
        navigate(`/Edit/${item.bill_id}`, { state: { data: item } });
    };
    useEffect(() => {
        fetch("https://webapiforproperly.azurewebsites.net/api/Apartment") 
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => {
                if (data.length > 0) {
                    setCount(data[1]);
                    setData(data[0]); // Set the data in the state
                }
                else {
                    setCount(0);
                }
            })
            .catch((error) => {
                setError(error.message); // Handle errors
            });
    }, []);
    return (
        // Div for Alert Box
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-4">
                <h1>ข้อมูลหอพักทั้งหมด</h1>
                <Button variant="success"
                    type="submit"
                    className="me-2"
                    size="lg"
                    alt= "Add Data"
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={() => NavAddData(count)}><HouseAdd /></Button>
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deleting</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure to delete this data</Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => deleteData(tempData)}>
                        Delete
                    </Button>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
            <Table striped bordered hover responsive >
                <thead className="table-dark" >
                    <tr>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>เลขที่บิล</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>เลขที่ห้อง</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>ประจำเดือน/ปี</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>ค่าห้อง</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>ค่ามิเตอร์เดือนก่อน</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>ค่ามิเตอร์เดือนปัจจุบัน</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>ส่วนต่างมิเตอร์</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>ค่าน้ำต่อหน่วย</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>ค่าขยะ</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>ค่าอื่นๆ</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>รวม</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Print</th>
                        <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, rowIndex) => (
                        <tr key={rowIndex}>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.bill_id}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.room_number}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.month}/{item.year}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.room_rent}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.previous_meter_month}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.water_reading_meter}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.water_diff}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.water_unit_fees}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.garbage_fees}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.other_fees}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>{item.total_amount}</td>
                            <td style={{ whiteSpace: 'nowrap', textAlign: 'center' }}><Button variant="primary" size="lg" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}  onClick={() => downloadPdf(item)}><Printer /></Button></td>
                            <td>
                                <div style={{ display: 'flex', justifyContent: 'center' }}> {/* Center buttons horizontally */}
                                    <Button
                                        variant="warning"
                                        className="me-2"
                                        size="lg"
                                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                        onClick={() => handleEdit(item)} 
                                    >
                                        <PencilSquare />
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="me-2"
                                        size="lg"
                                        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                                        onClick={() => handleShow(item)}
                                        /*onClick={() => deleteData(item)}*/
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};
const style = {
    // Table custom styles can go here if needed
    tableBill: {
        width: '100%',
        marginTop: '20px',
    },
};
export default DataPage;
