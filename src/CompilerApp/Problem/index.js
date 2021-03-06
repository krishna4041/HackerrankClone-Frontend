import React, {Component} from 'react'
import withRouter from 'react-router-dom/withRouter';
import {
    Container,
    Input,
    Button,
    Row,
    Col,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter
} from 'reactstrap'
import NavBar from '../templates/NavBar';
import { ClipLoader } from 'react-spinners';
import Alert from 'reactstrap/lib/Alert';
import './style.css'

const _ = require('lodash')

class Problem extends Component {
    constructor() {
        super()
        this.state = {
            loadedData          : false,
            responseSuccessful  : false,
            name                : '',
            description         : '',
            sampleInput         : '',
            smapleOutput        : '',
            difficulty          : '',
            mainCode            : '',
            userCode            : '',
            showModal           : false,
            runProcessType      : '',
            runProcessComplete  : false,
            runProcessSuccessful: false,
            runProcessOutput    : '',
        }
        this.fetchProblem   = this.fetchProblem.bind(this)
        this.onCompile      = this.onCompile.bind(this)
        this.onRun          = this.onRun.bind(this)
        this.toggleModal    = this.toggleModal.bind(this)
        this.handleUserCode = this.handleUserCode.bind(this)
    }
    fetchProblem(problemId) {
        fetch(`http://localhost:8000/problem/${problemId}`)
            .then(res => {
                if (res.status === 200) {
                    return res.json()
                }
                throw new Error(res.statusText)
            })
            .then(p => {
                this.setState({
                    loadedData        : true,
                    responseSuccessful: true,
                    name              : p.problem_name,
                    description       : p.problem_description,
                    sampleInput       : p.problem_sampleInput,
                    smapleOutput      : p.problem_sampleOutput,
                    difficulty        : p.problem_level,
                    mainCode          : p.problem_main_file,
                    userCode          : p.problem_body_file
                })
            })
            .catch(err => {
                this.setState({
                    loadedData: true,
                    responseSuccessful: false,
                })
                console.log(err)
            })
    }
    toggleModal() {
        this.setState(prev => ({
            showModal: !prev.showModal
        }))
    }
    handleUserCode(event) {
        this.setState({
            userCode: event.target.value
        })  
    }
    onCompile() {
        this.setState({
            showModal: true,
            runProcessComplete: false,
            runProcessType: 'compiling',
            runProcessSuccessful: true,
            runProcessOutput: [],
        // })
        }, () => {
            fetch(`http://localhost:8000/compileproblem/${this.props.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text_box: this.state.userCode
                })
            })
                .then(res => {
                    if (res.status < 300) {
                        return res.json()
                    }
                    throw new Error(res.statusText)
                })
                .then(p => {
                    this.setState({
                        showModal: true,
                        runProcessComplete: true,
                        runProcessSuccessful: true,
                        runProcessOutput: p
                    })
                })
                .catch(err => {
                    this.setState({
                        showModal: true,
                        runProcessComplete: true,
                        runProcessSuccessful: false,
                    })
                    console.log(err)
                })
        })
    }
    onRun() {
        this.setState({
            showModal: true,
            runProcessComplete: false,
            runProcessType: 'running',
            runProcessSuccessful: true,
            runProcessOutput: []
        // })
        }, () => {
            fetch(`http://localhost:8000/runproblem/${this.props.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text_box: this.state.userCode
                })
            })
                .then(res => {
                    if (res.status < 300) {
                        return res.json()
                    }
                    throw new Error(res.statusText)
                })
                .then(p => {
                    this.setState({
                        showModal: true,
                        runProcessComplete: true,
                        runProcessSuccessful: true,
                        runProcessOutput: p
                    })
                })
                .catch(err => {
                    this.setState({
                        showModal: true,
                        runProcessComplete: true,
                        runProcessSuccessful: false,
                    })
                    console.log(err)
                })
        })
    }
    componentDidMount() {
        this.fetchProblem(this.props.id)
    }
    render() {
        return (
            <Container fluid>
                <NavBar />
                <Container className='top-spacing'>
                    {
                        this.state.loadedData ?
                            this.state.responseSuccessful ?
                                <React.Fragment>
                                    <h1 className='display-3'>{this.state.name}</h1>
                                    <hr/>
                                    <p>Difficulty: {this.state.difficulty}</p>
                                    <hr />
                                    <p>{this.state.description}</p>
                                    <hr />
                                    <div>
                                        <div>
                                            <p><b>Sample Input</b></p>
                                            <pre className='code-area'>
                                                {_.split(this.state.sampleInput, "\n").map(input => 
                                                    input.length !== 0 && 
                                                        <React.Fragment>
                                                            <span>{input}</span><br />
                                                        </React.Fragment>    
                                                )}
                                            </pre>
                                        </div>
                                        <div>
                                            <p><b>Sample Output</b></p>
                                            <pre className='code-area'>
                                                {_.split(this.state.smapleOutput, "\n").map(output => 
                                                    output.length !== 0 && 
                                                        <React.Fragment>
                                                            <span>{output}</span><br />
                                                        </React.Fragment>    
                                                )}
                                            </pre>
                                        </div>
                                    </div>
                                    <hr />
                                    <Input
                                        type='textarea' 
                                        value={this.state.mainCode}
                                        rows={_.countBy(this.state.mainCode)["\n"] + 1 || 4}
                                        disabled
                                    />
                                    <Input
                                        type='textarea' 
                                        value={this.state.userCode}
                                        onChange={this.handleUserCode}
                                        rows={_.countBy(this.state.userCode)["\n"] + 1 || 4}
                                    />
                                    <hr />
                                    <Row>
                                        <Col>
                                            <Button
                                                color='success'
                                                onClick={this.onCompile}
                                                >
                                                COMPILE
                                            </Button>
                                            {' '}
                                            <Button
                                                color='danger'
                                                onClick={this.onRun}
                                                >
                                                RUN
                                            </Button>
                                        </Col>
                                    </Row>
                                </React.Fragment>
                            :
                            <Alert color='danger'>
                                SERVER UNRESPONSIVE! PLEASE TRY AGAIN LATER
                            </Alert>
                        :
                        <div className='page-loader'>
                            <ClipLoader />
                        </div>
                    }
                </Container>
                <Modal isOpen={this.state.showModal} toggle={this.toggleModal}>
                    <ModalHeader toggle={this.toggleModal}>{this.state.runProcessType.toUpperCase()}</ModalHeader>
                    <ModalBody className='text-center'>
                        {
                            this.state.runProcessComplete ?
                                this.state.runProcessSuccessful ?
                                    this.state.runProcessType === 'compiling' ?
                                        this.state.runProcessOutput.length === 0 ?
                                            <div>Compiled Successfully!</div>
                                        :
                                            <div className='text-left'>
                                                {this.state.runProcessOutput.map(output => 
                                                    <p>{output}</p>    
                                                )}
                                            </div>
                                    :
                                        this.state.runProcessType === 'running' &&
                                            this.state.runProcessOutput[0] === "-1" ?
                                                <div>Passes all Test Cases</div>    
                                                :
                                                <div>
                                                    {'Failed Test Case: '}
                                                    {this.state.runProcessOutput.map(output => 
                                                            <span>{output} </span>
                                                    )}
                                                </div>
                                :
                                <div>
                                    {this.state.runProcessType.toUpperCase()}... Failed!
                                    Please try again later!!
                                </div>
                            :
                            <div>
                                {this.state.runProcessType.toUpperCase()}... Please wait!
                                <div>
                                    <ClipLoader />
                                </div>
                            </div>                                
                        }
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={this.toggleModal}>Done</Button>
                    </ModalFooter>
                </Modal>
            </Container>
        )
    }
}

export default withRouter(Problem)