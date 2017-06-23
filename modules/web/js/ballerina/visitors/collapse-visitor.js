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
import log from 'log';
import _ from 'lodash';
import ASTFactory from './../ast/ballerina-ast-factory';
import CollapsedView from '../components/utils/collapsed-view';
import SimpleBBox from './../ast/simple-bounding-box';

let previousWidth = 0;
let previousHeight = 0;
let previousParent;
/**
 * Visitor class to handle collapsing of the all the statement boxes in diagram.
 *
 * @class CollapseVisitor
 * */
class CollapseVisitor {
    constructor() {
        this.previousX = 0;
        this.previousY = 0;
        this.highestIndex = 0;
        this.width = 120;
        this.height = 30;
        this.bBox = {};

        this.collapseStatements = [];
    }

    /**
     * can visit the visitor.
     * @return {boolean} true or false
     *
     * @memberOf CollapseVisitor
     * */
    canVisit() {
        return true;
    }

    /**
     * begin visiting the visitor.
     *
     * @memberOf CollapseVisitor
     * */
    beginVisit(node) {
        let viewState = node.getViewState();

        if (ASTFactory.isAssignmentStatement(node)) {

            if (previousHeight !== 0 && previousWidth !== 0 && previousParent &&previousParent.id === node.parent.id) {
                debugger;
            } else {
                this.previousX = viewState.bBox.x;
                this.previousY = viewState.bBox.y;

                const bBox = Object.assign({}, new SimpleBBox());
                bBox.w = this.width;
                bBox.h = this.height;
                bBox.x = this.previousX = 157;
                bBox.y = this.previousY = 222;

                previousHeight = this.height;
                previousWidth = this.width;
                previousParent = node.parent;

                // const parentStatements = node.parent.filterChildren(child =>
                //     ASTFactory.isAssignmentStatement(child));
                this.highestIndex = _.findIndex(node.parent.getChildren(), node);
                this.collapseStatements.push(new CollapsedView(bBox, node.parent, this.highestIndex));
            }

            viewState.bBox.w = 0;
            viewState.bBox.h = 0;
            viewState.bBox.x = 0;
            viewState.bBox.y = 0;
            viewState.components.collapse = {
                isCollapsed: true,
                width: this.width,
                height: this.height,
                maxIndex: this.highestIndex
            };
        } else if(ASTFactory.isFunctionDefinition(node) ||
            ASTFactory.isIfElseStatement(node) ||
            ASTFactory.isIfStatement(node)){
            previousWidth = 0;
            previousHeight = 0;
            previousParent = null;
        }
    }

    /**
     * visit the visitor.
     *
     * @memberOf CollapseVisitor
     * */
    visit() {
    }

    /**
     * visit the visitor at the end.
     *
     * @param {ASTNode} node - AST Node.
     *
     * @memberOf CollapseVisitor
     * */
    endVisit(node) {

    }

    getCollapsedViews() {
        return this.collapseStatements;
    }
}

export default CollapseVisitor;