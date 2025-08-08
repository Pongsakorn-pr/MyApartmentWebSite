import { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import apiClient from './apiClient';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeftSquare } from 'react-bootstrap-icons';
const EditDataPage = () => {
    const { state } = useLocation(); // Get data passed from the previous page
    const [formData, setFormData] = useState(state ? state.data : {});

    useEffect(() => {
        if (state) {
            setFormData(state.data); // If data is passed through state, set it
        }
    }, [state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'room_rent' || name === 'water_reading_meter' || name === 'previous_meter_month' || name === 'other_fees' || name === 'garbage_fees'
            ? parseFloat(value) || 0  // Use parseFloat to convert string to number, default to 0 if NaN
            : value;
        if (name === 'water_reading_meter') {
            const newWaterDiff = newValue - formData.previous_meter_month; // Ensure both values are numbers
            setFormData((prevFormData) => {
                const updatedFormData = { ...prevFormData, [name]: newValue, water_diff: newWaterDiff };
                const totalAmount = updatedFormData.room_rent + (updatedFormData.water_diff * 30) + updatedFormData.garbage_fees + updatedFormData.other_fees;
                return { ...updatedFormData, total_amount: totalAmount };
            });
        } else {
            setFormData((prevFormData) => {
                const updatedFormData = { ...prevFormData, [name]: newValue };
                const totalAmount = updatedFormData.room_rent + (updatedFormData.water_diff * 30) + updatedFormData.garbage_fees + updatedFormData.other_fees;
                return { ...updatedFormData, total_amount: totalAmount };
            });
        }
    };

    const handleSubmit = async (event,item) => {
        event.preventDefault();
        try {
            await apiClient.put(`/api/Apartment/${formData.bill_id+1}`, item);
            console.log("Data updated", item);
        } catch (error) {
            console.error("Error editing data:", error);
        }
    };
    return (
        <div>
            <h1>แก้ไขข้อมูล</h1>
            <Form style={{ marginTop: '10px' }}>
                <Form.Group controlId="bill_id">
                    <Form.Label>เลขที่บิล</Form.Label>
                    <Form.Control
                        type="text"
                        name="bill_id"
                        value={formData.bill_id || ''}
                        onChange={handleChange}
                        disabled
                    />
                </Form.Group>

                <Form.Group controlId="room_number" style={{ marginTop: '10px' }}>
                    <Form.Label>เลขที่ห้อง</Form.Label>
                    <Form.Control
                        type="text"
                        name="room_number"
                        value={formData.room_number || ''}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="room_rent" style={{ marginTop: '10px' }}>
                    <Form.Label>ค่าเช่าห้อง</Form.Label>
                    <Form.Control
                        type="number"
                        name="room_rent"
                        value={formData.room_rent || 0}
                        onChange={handleChange}
                    />
                </Form.Group>

                <Form.Group controlId="water_reading_meter" style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ flex: '1' }}>
                            <Form.Label>มิเตอร์เดือนปัจจุบัน</Form.Label>
                            <Form.Control
                                type="number"
                                name="water_reading_meter"
                                value={formData.water_reading_meter || 0}
                                onChange={handleChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ flex: '1' }}>
                            <Form.Label>มิเตอร์เดือนก่อนหน้า</Form.Label>
                            <Form.Control
                                type="number"
                                name="previous_meter_month"
                                value={formData.previous_meter_month || 0}
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
                        value={formData.water_diff || 0}
                        onChange={handleChange}
                        disabled
                    />
                </Form.Group>
                <Form.Group controlId="water_unit_fees" style={{ marginTop: '10px' }}>
                    <Form.Label>ค่าน้ำต่อหน่วย</Form.Label>
                    <Form.Control
                        type="number"
                        name="water_unit_fees"
                        value={formData.water_unit_fees || 0}
                        onChange={handleChange}
                        disabled
                    />
                </Form.Group>
                <Form.Group controlId="garbage_fees" style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                        <div style={{ flex: '1' }}>
                            <Form.Label>ค่าขยะ</Form.Label>
                            <Form.Control
                                type="number"
                                name="garbage_fees"
                                value={formData.garbage_fees || 0}
                                onChange={handleChange}
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div style={{ flex: '1' }}>
                            <Form.Label>ค่าอื่นๆ</Form.Label>
                            <Form.Control
                                type="number"
                                name="other_fees"
                                value={formData.other_fees || 0}
                                onChange={handleChange}
                                style={{ width: '100%', backgroundColor: '#e9ecef' }}
                            />
                        </div>
                    </div>
                </Form.Group>
                <Form.Group controlId="total_amount" style={{ marginTop: '10px' }}>
                    <Form.Label>รวม</Form.Label>
                    <Form.Control
                        type="number"
                        name="total_amount"
                        value={formData.total_amount || 0}
                        onChange={handleChange}
                        disabled
                    />
                </Form.Group>
                {/* Add other fields as needed */}
                <div style={{ marginTop: '20px' }}>
                    <Button variant="primary" type="button" style={{ marginTop: '10px' }} onClick={(event) => handleSubmit(event, formData)} >
                        Save Changes
                    </Button>
                    <Button variant="danger" type="button" style={{ marginTop: '10px', float: 'right' }}><Link to="/"><ArrowLeftSquare /></Link></Button>
                </div>
            </Form>
        </div>
    );
};

export default EditDataPage;
