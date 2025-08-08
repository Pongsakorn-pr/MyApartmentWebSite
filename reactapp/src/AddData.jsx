import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import apiClient from './apiClient';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeftSquare } from 'react-bootstrap-icons';
const AddDataPage = () => {
    const { state } = useLocation(); // Get data passed from the previous page
    const currentDate = new Date();
    const [dis, setdis] = useState(true);
    const [formData, setFormData] = useState([]);
    var DefaultDataObject = {
        bill_id: 1,
        room_number: '',
        bill_month_year: '',
        room_rent: 3500,
        water_reading_meter: 0,
        water_unit_fees: 30,
        garbage_fees: 20,
        other_fees: 0,
        previous_meter_month: 0,
        water_diff: 0,
        total_amount: 0,
        Month: currentDate.getMonth() + 1,
        Year: currentDate.getFullYear()+543,
        BAHT: '',
        Month_TH: ''
    };
    useEffect(() => {
        setFormData(DefaultDataObject);
        if (state && state.data) {
            setFormData(prevFormData => ({
                ...prevFormData,
                bill_id: state.data + 1, // Update only the bill_id
            }));
        }
    }, [state]);
    const handleChange = async (e) => {
        const { name, value } = e.target;
        if (name === 'room_number' && value != '') {
            try {
                const dataObj = {
                    room_number: value,
                    month: currentDate.getMonth(), // Months are zero-indexed
                    year: currentDate.getFullYear()+543
                };
                console.log(dataObj);
                const response = await apiClient.post('/api/Apartment/oldMeter', dataObj);
                console.log(response);
                if (response.status === 200) { // Check the response status
                    var newWater = 0;
                    if (response.data.length > 0) {
                        newWater = response.data[0].water_reading_meter;
                    }
                    formData.previous_meter_month = newWater;
                    formData.bill_month_year = currentDate.toLocaleDateString('en-GB');
                    console.log("Finished");
                    setdis(false);
                } else {
                    console.error("Error in response:", response);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        const newValue = name === 'room_rent' || name === 'water_reading_meter' || name === 'previous_meter_month' || name === 'other_fees' || name === 'garbage_fees'
            ? parseFloat(value) || 0  // Use parseFloat to convert string to number, default to 0 if NaN
            : value;
        console.log(name);
        console.log(newValue);
        if (name === 'water_reading_meter' && value != '' && value != 0 && value >= formData.previous_meter_month) {
            const newWaterDiff = newValue - formData.previous_meter_month; // Ensure both values are numbers
            console.log("Edited");
            setFormData((prevFormData) => {
                const updatedFormData = { ...prevFormData, [name]: newValue, water_diff: newWaterDiff };
                const totalAmount = updatedFormData.room_rent + (updatedFormData.water_diff * 30) + updatedFormData.garbage_fees + updatedFormData.other_fees;
                return { ...updatedFormData, total_amount: totalAmount };
            });
            console.log(JSON.stringify(formData));
        } else {
            console.log("Edited2");
            setFormData((prevFormData) => {
                const updatedFormData = { ...prevFormData, [name]: newValue };
                const totalAmount = updatedFormData.room_rent + (updatedFormData.water_diff * 30) + updatedFormData.garbage_fees + updatedFormData.other_fees;
                return { ...updatedFormData, total_amount: totalAmount };
            });
            console.log(JSON.stringify(formData));
        }
    };
    const submitData = async (event, item) => {
        try {
            item.BAHT = '=BAHTTEXT(' + item.total_amount + ')';
            item.Month_TH = '=TEXT((' + item.bill_month_year + '), "MMMM") & " " & TEXT(' + (item.Year+543) + ', "0")';
            console.log(item);
            const response = await apiClient.post('/api/Apartment', item);
            console.log(response);
            if (response.status === 201) {
                console.log("Successful");
                // Reset the data to default
                var newDataObject = DefaultDataObject;
                newDataObject.bill_id = item.bill_id + 1;
                setdis(true);
                setFormData(newDataObject);
            }
        } catch (error) {
            console.error("Error insert Data:", error);
        }
    };
    return (
        <div>
            <h1>เพิ่มข้อมูล</h1>
            <Form style={{ marginTop: '10px' }}>
                <Form.Group controlId="bill_id">
                    <Form.Label>เลขที่บิล</Form.Label>
                    <Form.Control
                        type="text"
                        name="bill_id"
                        value={formData.bill_id || 1}
                        onChange={handleChange}
                        disabled
                    />
                </Form.Group>

                <Form.Group controlId="room_number" style={{ marginTop: '10px' }}>
                    <Form.Label>เลขที่ห้อง</Form.Label>
                    <Form.Select
                        name="room_number"
                        value={formData.room_number}
                        onChange={handleChange}>
                        <option value="">เลือกเลขที่ห้อง</option>
                        <option value="115/5">115/5</option>
                        <option value="115/6">115/6</option>
                        <option value="115/7">115/7</option>
                        <option value="115/8">115/8</option>
                        <option value="115/9">115/9</option>
                        <option value="115/10">115/10</option>
                        <option value="115/11">115/11</option>
                        <option value="115/12">115/12</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId="room_rent" style={{ marginTop: '10px' }}>
                    <Form.Label>ค่าเช่าห้อง</Form.Label>
                    <Form.Select
                        name="room_rent"
                        value={formData.room_rent}
                        onChange={handleChange}
                        disabled={dis}>
                        <option value="3500">3500</option>
                        <option value="3000">3000</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group controlId="water_reading_meter" style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ flex: '1' }}>
                            <Form.Label>มิเตอร์เดือนปัจจุบัน</Form.Label>
                            <Form.Control
                                type="number"
                                name="water_reading_meter"
                                value={formData.water_reading_meter}
                                onChange={handleChange}
                                style={{ width: '100%' }}
                                disabled={dis}
                            />
                        </div>

                        <div style={{ flex: '1' }}>
                            <Form.Label>มิเตอร์เดือนก่อนหน้า</Form.Label>
                            <Form.Control
                                type="number"
                                name="previous_meter_month"
                                value={formData.previous_meter_month}
                                onChange={handleChange}
                                disabled
                                style={{ width: '100%', backgroundColor: '#e9ecef' }}
                            />
                        </div>
                    </div>
                </Form.Group>

                <Form.Group controlId="water_diff" style={{ marginTop: '10px' }}>
                    <Form.Label>ส่วนต่างมิเตอร์</Form.Label>
                    <Form.Control
                        type="number"
                        name="water_diff"
                        value={formData.water_diff}
                        onChange={handleChange}
                        disabled
                    />
                </Form.Group>
                <Form.Group controlId="water_unit_fees" style={{ marginTop: '10px' }}>
                    <Form.Label>ค่าน้ำต่อหน่วย</Form.Label>
                    <Form.Control
                        type="number"
                        name="water_unit_fees"
                        value={formData.water_unit_fees}
                        onChange={handleChange}
                        disabled={dis}
                    />
                </Form.Group>
                <Form.Group controlId="garbage_fees" style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ flex: '1' }}>
                            <Form.Label>ค่าขยะ</Form.Label>
                            <Form.Control
                                type="number"
                                name="garbage_fees"
                                value={formData.garbage_fees}
                                onChange={handleChange}
                                style={{ width: '100%' }}
                                disabled={dis}
                            />
                        </div>

                        <div style={{ flex: '1' }}>
                            <Form.Label>ค่าอื่นๆ</Form.Label>
                            <Form.Control
                                type="number"
                                name="other_fees"
                                value={formData.other_fees}
                                onChange={handleChange}
                                style={{ width: '100%'}}
                                disabled={dis}
                            />
                        </div>
                    </div>
                </Form.Group>
                <Form.Group controlId="total_amount" style={{ marginTop: '10px' }}>
                    <Form.Label>รวม</Form.Label>
                    <Form.Control
                        type="number"
                        name="total_amount"
                        value={formData.total_amount}
                        onChange={handleChange}
                        disabled
                    />
                </Form.Group>
                {/* Add other fields as needed */}
                <div style={{ marginTop: '20px' }}>
                    <Button variant="primary" type="button" style={{ marginTop: '10px' }} onClick={(event) => submitData(event, formData)}>
                        Save
                    </Button>
                    <Button variant="danger" type="button" style={{ marginTop: '10px', float: 'right' }}> <Link to="/" ><ArrowLeftSquare style={{ color: 'white' }} /></Link></Button>
                </div>
            </Form>
        </div>
    );
};

export default AddDataPage;
