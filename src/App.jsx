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
    ModalFooter, Alert
} from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import axios from 'axios';
import ReactECharts from 'echarts-for-react';

const PCRecommender = () => {
    const [requirements, setRequirements] = useState({
        Brand: '',
        Processor: '',
        RAM: 4,
        Has_Sacoche: 1,
        Is_Available: 1
    });

    const [inferenceData, setInferenceData] = useState({
        product_name: '',
        price: ''
    });

    const [recommendations, setRecommendations] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [inferenceResult, setInferenceResult] = useState(null);
    const [inferenceLoading, setInferenceLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const [trainingMetrics, setTrainingMetrics] = useState(null);
    const [trainingLoading, setTrainingLoading] = useState(false);

    const handleRequirementChange = (e) => {
        const { name, value, type } = e.target;
        setRequirements(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    const getRecommendations = async () => {
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

    const trainModel = async () => {
        setTrainingLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/train-model');

            setTrainingMetrics(response.data);

            toast.success('Model training completed!', {
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
                title: 'Training Error',
                text: 'Failed to train model: ' + err.message,
                confirmButtonColor: '#d33'
            });

            toast.error('Failed to train model', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        } finally {
            setTrainingLoading(false);
        }
    };

    const getHeatmapOption = (confusionMatrix) => ({
        tooltip: {
            position: 'top',
        },
        xAxis: {
            type: 'category',
            data: ['Predicted 0', 'Predicted 1'],
            axisLabel: { interval: 0 },
        },
        yAxis: {
            type: 'category',
            data: ['Actual 1', 'Actual 0'],
            axisLabel: { interval: 0 },
        },
        visualMap: {
            min: 0,
            max: Math.max(...confusionMatrix.flat()),
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '15%'
        },
        series: [
            {
                name: 'Confusion Matrix',
                type: 'heatmap',
                data: confusionMatrix.flatMap((row, i) => row.map((value, j) => [j, i, value])),
                label: {
                    show: true,
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    });

    const handleInferenceChange = (e) => {
        const { name, value } = e.target;
        setInferenceData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const makeInference = async () => {
        if (!inferenceData.product_name || !inferenceData.price) {
            toast.warning('Please fill in both product name and price');
            return;
        }

        setInferenceLoading(true);
        try {
            // Changed to use query parameters instead of request body
            const response = await axios.post(`http://localhost:8000/inference?product_name=${encodeURIComponent(inferenceData.product_name)}&price=${encodeURIComponent(inferenceData.price)}`);

            setInferenceResult(response.data);
            toast.success('Inference completed successfully!');
        } catch (err) {
            toast.error('Failed to make inference: ' + (err.response?.data?.detail || err.message));
        } finally {
            setInferenceLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <ToastContainer />

            <Row>
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
                                        {['Celeron N4500', 'I3', 'I5', 'I7', 'AMD Ryzen'].map(processor => (
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

                <Col md={6}>
                    <Card className="mb-4 shadow">
                        <CardHeader className="bg-primary text-white">Train Model</CardHeader>
                        <CardBody>
                            <Button
                                color="primary"
                                onClick={trainModel}
                                disabled={trainingLoading}
                                className="btn-block"
                            >
                                {trainingLoading ? 'Training...' : 'Train Model'}
                            </Button>

                            {trainingMetrics && (
                                <div className="mt-4">
                                    <h5 className="text-muted">Training Results</h5>
                                    <p><strong>Message:</strong> {trainingMetrics.message}</p>
                                    <p><strong>Accuracy:</strong> {(trainingMetrics.accuracy * 100).toFixed(2)}%</p>

                                    <h6 className="mt-3">Confusion Matrix</h6>
                                    <ReactECharts
                                        option={getHeatmapOption(trainingMetrics.confusion_matrix)}
                                        style={{ height: '300px', width: '100%' }}
                                    />
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    <Card className="mb-4 shadow">
                        <CardHeader className="bg-info text-white">Product Availability Prediction</CardHeader>
                        <CardBody>
                            <Form>
                                <FormGroup>
                                    <Label className="text-muted">Product Name</Label>
                                    <Input
                                        type="text"
                                        name="product_name"
                                        value={inferenceData.product_name}
                                        onChange={handleInferenceChange}
                                        className="form-control-lg"
                                        placeholder="Enter product name"
                                    />
                                </FormGroup>

                                <FormGroup>
                                    <Label className="text-muted">Price</Label>
                                    <Input
                                        type="number"
                                        name="price"
                                        value={inferenceData.price}
                                        onChange={handleInferenceChange}
                                        className="form-control-lg"
                                        placeholder="Enter price"
                                        step="0.01"
                                        min="0"
                                    />
                                </FormGroup>

                                <Button
                                    color="info"
                                    onClick={makeInference}
                                    disabled={inferenceLoading}
                                    className="mt-3 btn-block"
                                >
                                    {inferenceLoading ? 'Predicting...' : 'Predict Availability'}
                                </Button>

                                {inferenceResult && (
                                    <Alert color={inferenceResult.prediction === "In stock" ? "success" : "warning"} className="mt-3">
                                        <h5 className="alert-heading">Prediction Result</h5>
                                        <p className="mb-0">
                                            <strong>Product:</strong> {inferenceResult.product_name}<br />
                                            <strong>Price:</strong> {inferenceResult.price} DT<br />
                                            <strong>Availability:</strong> {inferenceResult.prediction}
                                        </p>
                                    </Alert>
                                )}
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
                                    <th>RAM (GB)</th>
                                    <th>Has Laptop Bag</th>
                                    <th>Is Available</th>
                                </tr>
                                </thead>
                                <tbody>
                                {recommendations.map((rec, index) => (
                                    <tr key={index}>
                                        <td>{rec.Brand}</td>
                                        <td>{rec.Processor}</td>
                                        <td>{rec.RAM}</td>
                                        <td>{rec.Has_Sacoche ? 'Yes' : 'No'}</td>
                                        <td>{rec.Is_Available ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
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
