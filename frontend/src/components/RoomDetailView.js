import React from 'react';
import { withRouter } from "react-router-dom";
import axios from "axios";
import { Alert, DatePicker, Card, Row, Col, Button, Tooltip, Modal, Input, } from "antd";
import moment from "moment";
import UserContext from "../context/usercontext";
import { fromDecimal } from "../utility"

class RoomDetail extends React.Component {
    static contextType = UserContext

    constructor(props) {
        super(props);
        this.state = {
            slots: null,
            start: null,
            end: null,
            date: moment().add(1, "day").format("YYYY-MM-DD"),
            modalVisible: false,
            purpose: "Purpose not provided",
            showMessage: false,
            message: "You cannot book 2 slots at the same time"
        }
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    componentDidMount() {
        const config = { headers: { "Authorization": `Token ${this.context.token}` } }
        const roomID = this.props.match.params.roomID;
        console.log(this.props)
        const date = this.state.date;
        axios.post(`http://127.0.0.1:8000/api/filter/roomfilter/`, {
            "date": date,
            "roomId": roomID,
        }, config).then(res => { this.setState({ slots: res.data }) })
    }

    onDateChange = (_date, dateString) => {
        if (dateString !== "") {
            const roomID = this.props.match.params.roomID;
            const config = { headers: { "Authorization": `Token ${this.context.token}` } }
            axios.post(`http://127.0.0.1:8000/api/filter/roomfilter/`, {
                "date": dateString,
                "roomId": roomID,
            }, config).then(res => { this.setState({ slots: res.data, date: dateString }) })
        }
    }

    handleButtonClick(event, data) {
        event.preventDefault();
        const roomID = this.props.match.params.roomID;
        const config = { headers: { "Authorization": `Token ${this.context.token}` } }
        axios.post(`http://127.0.0.1:8000/api/book/`, {
            "email": this.context.email,
            "date": this.state.date,
            "startTime": this.state.start,
            "endTime": this.state.end,
            "purpose_of_booking": this.state.purpose,
            "roomID": roomID,
        }, config).then(_res => {
            this.setState({ modalVisible: false })
            axios.post(`http://127.0.0.1:8000/api/filter/roomfilter/`, {
                "date": this.state.date,
                "roomId": roomID,
            }, config).then(res => { this.setState({ slots: res.data }) })
        }).catch(err => {
            console.log(err);
            this.setState({ modalVisible: false, showMessage: true })
        })
    }

    renderButton = (value) => {
        if (value["admin_did_accept"]) {
            return <Button type="primary" size="large" danger>Fully Booked</Button>
        } else if (value["is_pending"]) {
            return (
                <Tooltip title="Request in Queue" color="gold" placement="bottom">
                    <Button className="partiallyBookedBtn" size="large"
                        onClick={(e) => {
                            e.preventDefault();
                            this.setState({
                                modalVisible: true,
                                start: value["start_timing"],
                                end: value["end_timing"]
                            })
                        }}>
                        Partially Booked
                    </Button>
                </Tooltip>
            );
        } else {
            return (
                <Tooltip title="Available" color="#1890ff" placement="bottom">
                    <Button type="primary" className="bookPrimaryBtn" size="large"
                        onClick={(e) => {
                            e.preventDefault();
                            this.setState({
                                modalVisible: true,
                                start: value["start_timing"],
                                end: value["end_timing"]
                            })
                        }}>
                        Available
                    </Button>
                </Tooltip>
            );
        }
    }

    render() {
        return (
            <div>
                <Row gutter={[16, { xs: 32, sm: 24, md: 16, lg: 8 }]} style={{ justifyContent: 'center' }}>
                    {this.state.showMessage &&
                        <Col span={24}>
                            <Alert
                                message={this.state.message}
                                type="error"
                                afterClose={() => this.setState({ showMessage: false })}
                                showIcon
                                closable />
                        </Col>
                    }
                </Row>
                <Row gutter={[16, { xs: 32, sm: 24, md: 16, lg: 8 }]} style={{ justifyContent: 'center' }}>
                    <Col className="gutter-row" span={{ xs: 24, sm: 12, md: 8, lg: 6 }}>
                        <DatePicker
                            defaultValue={moment().add(1, 'day')}
                            onChange={this.onDateChange}
                            format={"YYYY-MM-DD"}
                            size="large"
                            showToday={false}
                            disabledDate={current => {
                                return current < moment();
                            }}
                        />
                    </Col>
                </Row>
                <Row gutter={[16, { xs: 32, sm: 24, md: 16, lg: 8 }]} style={{ justifyContent: 'space-around', marginTop: "20px" }}>
                    {this.state.slots !== null && this.state.slots.map((value, index) =>
                        <Col className="gutter-row" span={{ xs: 24, sm: 12, md: 8, lg: 6 }} key={index}>
                            <Card size="large" title={"Slot " + (index + 1)} style={{ width: 300 }} hoverable>
                                <p>From: {fromDecimal(value["start_timing"])}</p>
                                <p>To: {fromDecimal(value["end_timing"], 1)}</p>
                                <p>{this.renderButton(value)}</p>
                            </Card>
                        </Col>
                    )}
                    <Modal
                        title="Please state your Purpose of Booking"
                        centered
                        visible={this.state.modalVisible}
                        onOk={(e) => { this.handleButtonClick(e, { "start_timing": this.state.start, "end_timing": this.state.end }) }}
                        onCancel={() => { this.setState({ modalVisible: false }) }}
                    >
                        <Input.TextArea
                            placeholder="Enter your reason for booking this slot"
                            autoSize={{ minRows: 4, maxRows: 8 }}
                            onChange={(v) => { this.setState({ purpose: v.target.value }) }}
                        />
                    </Modal>
                </Row>
            </div >
        );
    }
}

export default withRouter(RoomDetail);