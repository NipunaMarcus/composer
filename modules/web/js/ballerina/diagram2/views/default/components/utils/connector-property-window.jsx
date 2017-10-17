/**
 * Copyright (c) 2017, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import './properties-form.css';
/**
 * React component for a service definition.
 *
 * @class ServiceDefinition
 * @extends {React.Component}
 */
class ConnectorPropertiesWindow extends React.Component {

    constructor(props) {
        super(props);
        this.previousItems = [];
        this.connectorProps = props.supportedProps;
        this.state = {
            properties: this.connectorProps,
        };
        this.onChange = this.onChange.bind(this);
        this.handleDismiss = this.handleDismiss.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.renderNumericInputs = this.renderNumericInputs.bind(this);
        this.renderTextInputs = this.renderTextInputs.bind(this);
        this.renderBooleanInputs = this.renderBooleanInputs.bind(this);
        this.toggleStructProperties = this.toggleStructProperties.bind(this);
        this.goToPreviousView = this.goToPreviousView.bind(this);
    }

    componentDidMount() {
        if (this.props.model.viewState.showOverlayContainer) {
            document.addEventListener('mouseup', this.handleOutsideClick, false);
        } else {
            document.removeEventListener('mouseup', this.handleOutsideClick, false);
        }
    }

    componentDidUpdate() {
        if (this.props.model.viewState.showOverlayContainer) {
            document.addEventListener('mouseup', this.handleOutsideClick, false);
        } else {
            document.removeEventListener('mouseup', this.handleOutsideClick, false);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('mouseup', this.handleOutsideClick, false);
    }

    /**
     * On change event for form inputs
     * @param event
     * @param index
     */
    onChange(event, key) {
        const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
        key.value = value;
        this.forceUpdate();
    }

    /**
     * Hanldes the dismiss/cancel event of the prop window
     */
    handleDismiss() {
        this.props.addedValues(this.connectorProps);
        this.props.model.viewState.showOverlayContainer = false;
        this.props.model.viewState.overlayContainer = {};
        this.context.editor.update();
    }

    /**
     * Handles the outside click of the prop window
     * @param e
     */
    handleOutsideClick(e) {
        if (this.node) {
            if (!this.node.contains(e.target)) {
                this.handleDismiss();
            }
        }
    }

    /**
     *
     */
    toggleStructProperties(fields) {
        this.previousItems.push(this.state.properties);
        this.setState({
            properties: fields,
        });
    }

    goToPreviousView() {
        const poppedData = this.previousItems.pop();
        this.setState({
            properties: poppedData,
        });
    }
    /**
     * Renders text input for form
     * @param key
     * @returns {XML}
     */
    renderTextInputs(key) {
        return (
            <div key={key.identifier} className="form-group">
                <label
                    htmlFor={key.identifier}
                    className='col-sm-4 property-dialog-label'
                >
                    {key.identifier}</label>
                <div className='col-sm-7'>
                    <input
                        className='property-dialog-form-control'
                        id={key.identifier}
                        name={key.identifier}
                        type='text'
                        placeholder={key.identifier}
                        value={key.value}
                        onChange={event => this.onChange(event, key)}
                    />
                </div>
            </div>);
    }

    /**
     * Renders numeric input for form
     * @param key
     * @returns {XML}
     */
    renderNumericInputs(key) {
        return (
            <div key={key.identifier} className="form-group">
                <label
                    htmlFor={key.identifier}
                    className='col-sm-4 property-dialog-label'
                >
                    {key.identifier}</label>
                <div className='col-sm-7'>
                    <input
                        className='property-dialog-form-control'
                        id={key.identifier}
                        name={key.identifier}
                        type='number'
                        placeholder={key.identifier}
                        value={key.value}
                        onChange={event => this.onChange(event, key)}
                    />
                </div>
            </div>);
    }

    /**
     * Renders boolean input for form
     * @param key
     * @param booleanValue
     * @returns {XML}
     */
    renderBooleanInputs(key, booleanValue) {
        return (
            <div key={key.identifier} className="form-group">
                <label
                    htmlFor={key.identifier}
                    className='col-sm-4 property-dialog-label'
                >
                    {key.identifier}</label>
                <div className='col-sm-7 properties-checkbox'>
                    <input
                        className="toggle"
                        type="checkbox"
                        id={key.identifier}
                        checked={booleanValue}
                        onChange={event => this.onChange(event, key)}
                    />
                </div>
            </div>);
    }
    /**
     * Renders structs / collapsible divs for form
     * @param key
     * @returns {XML}
     */
    renderStructs(key) {
        return (<div className="structsContainer">
            <div id='optionGroup' key={key.identifier} className="form-group">
                <label
                    htmlFor={key.identifier}
                    className='col-sm-4 property-dialog-label'
                >
                    {key.identifier}</label>
                <div className='col-sm-7'>
                    <input
                        className='property-dialog-form-control'
                        id={key.identifier}
                        name={key.identifier}
                        type='text'
                        placeholder='Specify a defined option object or a method'
                        value={key.value}
                        onChange={event => this.onChange(event, key)}
                    />
                </div>
                <div className='col-sm-1'>
                    <input
                        id='viewOptionParams'
                        type='button'
                        value='+'
                        onClick={() => { this.toggleStructProperties(key.fields); }}
                    />
                </div>
            </div>
        </div>);
    }
    /**
     * Renders the view for a property window
     *
     * @returns {ReactElement} The view.
     * @memberof PropertyWindow
     */
    render() {
        return (
            <div
                id={`popover-${this.props.model.id}`}
                key={`popover-${this.props.model.id}`}
            >
                <div
                    id="popover-arrow"
                    style={this.props.styles.arrowStyle}
                />
                <div
                    id="property-modal"
                    ref={(node) => { this.node = node; }}
                    key={`propertiesForm/${this.props.model.id}`}
                    style={this.props.styles.popover}
                >
                    <div className="form-header">
                        <button
                            id='dismissBtn'
                            type="button"
                            className="close"
                            aria-label="Close"
                            onClick={this.handleDismiss}
                        >
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h5 className="form-title file-dialog-title">
                            {this.props.formHeading}</h5>
                    </div>
                    <div className="form-body formContainer">
                        <div className="container-fluid">
                            <form className='form-horizontal propertyForm'>
                                {this.state.properties.map((key) => {
                                    if (key.bType === 'int') {
                                        return this.renderNumericInputs(key);
                                    } else if (key.bType === 'string') {
                                        return this.renderTextInputs(key);
                                    } else if (key.bType === 'boolean') {
                                        let booleanValue = false;
                                        if (key.value) {
                                            booleanValue = JSON.parse(key.value);
                                        }
                                        return this.renderBooleanInputs(key, booleanValue);
                                    } else {
                                        return this.renderStructs(key);
                                    }
                                })}
                            </form>
                        </div>
                        {!_.isEmpty(this.previousItems) &&
                        <div className='col-sm-3'>
                            <input
                                className="backBtn"
                                type='button'
                                value='&#xe68a;'
                                onClick={this.goToPreviousView}
                            />
                        </div> }
                    </div>
                </div>
            </div>);
    }
}

ConnectorPropertiesWindow.contextTypes = {
    editor: PropTypes.instanceOf(Object).isRequired,
};
export default ConnectorPropertiesWindow;