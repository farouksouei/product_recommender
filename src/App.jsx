import { useState } from 'react';
import {
    Container,
    Row,
    Col,
    Form,
    FormGroup,
    Label,
    Input,
    Button,
    Card,
    CardBody,
    CardHeader,
    Table,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import axios from 'axios';

const PCRecommender = () => {
    const [weights, setWeights] = useState({
        Brand: 1.0,
        Processor: 2.0,
        RAM: 4.0,
        Has_Sacoche: 0.8,
        Is_Available: 1.0
    });

    const [requirements, setRequirements] = useState({
        Brand: '',
        Processor: '',
        RAM: 4,
        Has_Sacoche: 1,
        Is_Available: 1
    });

    const [recommendations, setRecommendations] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const handleWeightChange = (e) => {
        const { name, value } = e.target;
        setWeights(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const handleRequirementChange = (e) => {
        const { name, value, type } = e.target;
        setRequirements(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    const updateWeights = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:8000/update-weights', weights);

            Swal.fire({
                icon: 'success',
                title: 'Weights Updated',
                text: 'Recommendation weights have been successfully updated!',
                confirmButtonColor: '#3085d6'
            });

            toast.success('Weights updated successfully!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: 'Failed to update weights: ' + err.message,
                confirmButtonColor: '#d33'
            });

            toast.error('Failed to update weights', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } finally {
            setLoading(false);
        }
    };

    const getRecommendations = async () => {
        // Validate input before making API call
        if (!requirements.Brand || !requirements.Processor) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete Requirements',
                text: 'Please select a Brand and Processor',
                confirmButtonColor: '#ffc107'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/get-recommendations', requirements);

            setRecommendations(response.data.recommendations);
            setMetrics(response.data.metrics);

            toast.success(`Found ${response.data.recommendations.length} recommendations`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });

            setModalOpen(true);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Recommendation Error',
                text: 'Failed to get recommendations: ' + err.message,
                confirmButtonColor: '#d33'
            });

            toast.error('Failed to fetch recommendations', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <ToastContainer />

            <Row>
                <Col md={6}>
                    <Card className="mb-4 shadow">
                        <CardHeader className="bg-primary text-white">Weights Configuration</CardHeader>
                        <CardBody>
                            <Form>
                                {Object.entries(weights).map(([key, value]) => (
                                    <FormGroup key={key}>
                                        <Label className="text-muted">{key}</Label>
                                        <Input
                                            type="number"
                                            step="0.1"
                                            name={key}
                                            value={value}
                                            onChange={handleWeightChange}
                                            className="form-control-lg"
                                        />
                                    </FormGroup>
                                ))}
                                <Button
                                    color="primary"
                                    onClick={updateWeights}
                                    disabled={loading}
                                    className="mt-3 btn-block"
                                >
                                    {loading ? 'Updating...' : 'Update Weights'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="mb-4 shadow">
                        <CardHeader className="bg-success text-white">PC Requirements</CardHeader>
                        <CardBody>
                            <Form>
                                <FormGroup>
                                    <Label className="text-muted">Brand</Label>
                                    <Input
                                        type="select"
                                        name="Brand"
                                        value={requirements.Brand}
                                        onChange={handleRequirementChange}
                                        className="form-control-lg"
                                    >
                                        <option value="">Select Brand</option>
                                        {['ASUS', 'LENOVO', 'HP', 'DELL', 'ACER'].map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </Input>
                                </FormGroup>

                                <FormGroup>
                                    <Label className="text-muted">Processor</Label>
                                    <Input
                                        type="select"
                                        name="Processor"
                                        value={requirements.Processor}
                                        onChange={handleRequirementChange}
                                        className="form-control-lg"
                                    >
                                        <option value="">Select Processor</option>
                                        {[
                                            'Celeron N4500',
                                            'I3',
                                            'I5',
                                            'I7',
                                            'AMD Ryzen'
                                        ].map(processor => (
                                            <option key={processor} value={processor}>{processor}</option>
                                        ))}
                                    </Input>
                                </FormGroup>

                                <FormGroup>
                                    <Label className="text-muted">RAM (GB)</Label>
                                    <Input
                                        type="number"
                                        name="RAM"
                                        value={requirements.RAM}
                                        onChange={handleRequirementChange}
                                        min="2"
                                        max="64"
                                        className="form-control-lg"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label className="text-muted">Has Laptop Bag</Label>
                                    <Input
                                        type="select"
                                        name="Has_Sacoche"
                                        value={requirements.Has_Sacoche}
                                        onChange={handleRequirementChange}
                                        className="form-control-lg"
                                    >
                                        <option value={1}>Yes</option>
                                        <option value={0}>No</option>
                                    </Input>
                                </FormGroup>

                                <FormGroup>
                                    <Label className="text-muted">Is Available</Label>
                                    <Input
                                        type="select"
                                        name="Is_Available"
                                        value={requirements.Is_Available}
                                        onChange={handleRequirementChange}
                                        className="form-control-lg"
                                    >
                                        <option value={1}>Yes</option>
                                        <option value={0}>No</option>
                                    </Input>
                                </FormGroup>

                                <Button
                                    color="success"
                                    onClick={getRecommendations}
                                    disabled={loading}
                                    className="mt-3 btn-block"
                                >
                                    {loading ? 'Searching...' : 'Get Recommendations'}
                                </Button>
                            </Form>
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <Modal
                isOpen={modalOpen}
                toggle={() => setModalOpen(!modalOpen)}
                size="xl"
            >
                <ModalHeader toggle={() => setModalOpen(false)} className="bg-info text-white">
                    PC Recommendations
                </ModalHeader>
                <ModalBody>
                    {recommendations.length > 0 && (
                        <>
                            <Table striped responsive hover>
                                <thead className="thead-dark">
                                <tr>
                                    <th>Brand</th>
                                    <th>Processor</th>
                                    <th>RAM</th>
                                    <th>Price (DT)</th>
                                    <th>Similarity Score</th>
                                    <th>Price Difference</th>
                                    <th>Final Score</th>
                                </tr>
                                </thead>
                                <tbody>
                                {recommendations.map((rec, index) => (
                                    <tr key={index}>
                                        <td>{rec.Brand}</td>
                                        <td>{rec.Processor}</td>
                                        <td>{rec.RAM}</td>
                                        <td>{rec['Price (DT)'].toFixed(2)}</td>
                                        <td>{(rec.Similarity_Score * 100).toFixed(1)}%</td>
                                        <td>{rec.Price_Difference.toFixed(2)}</td>
                                        <td>{rec.Final_Score.toFixed(2)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>

                            {metrics && (
                                <div className="mt-4 p-3 bg-light rounded">
                                    <h5 className="text-muted">Recommendation Metrics</h5>
                                    <Table borderless>
                                        <tbody>
                                        {Object.entries(metrics).map(([key, value]) => (
                                            <tr key={key}>
                                                <td className="font-weight-bold">{key}</td>
                                                <td>{typeof value === 'number' ? value.toFixed(2) : value}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={() => setModalOpen(false)}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </Container>
    );
};

export default PCRecommender;