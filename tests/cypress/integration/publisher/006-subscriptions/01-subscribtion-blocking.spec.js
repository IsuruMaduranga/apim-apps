
/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

describe("Subscription blocking", () => {
    const appName = 'subscribeapp' + Math.floor(Date.now() / 1000);
    const appDescription = 'app description';
    const developer = 'developer';
    const publisher = 'publisher';
    const password = 'test123';
    const carbonUsername = 'admin';
    const carbonPassword = 'admin';

    before(function(){
        cy.carbonLogin(carbonUsername, carbonPassword);
        cy.addNewUser(developer, ['Internal/subscriber', 'Internal/everyone'], password);
        cy.addNewUser(publisher, ['Internal/publisher', 'Internal/creator', 'Internal/everyone'], password);
    })
    
    it.only("Subscribe and unsubscribe to API from api details page", () => {
        cy.loginToPublisher(publisher, password);
        cy.deploySampleAPI();
        cy.logoutFromPublisher();
        cy.loginToDevportal(developer, password);
        cy.createApp(appName, appDescription);
        cy.visit('/devportal/apis?tenant=carbon.super');
        cy.url().should('contain', '/apis?tenant=carbon.super');
        cy.get('[title="PizzaShackAPI"]', { timeout: 30000 });
        cy.get('[title="PizzaShackAPI"]').click();
        cy.get('[data-testid="left-menu-credentials"]').click();

        // Click and select the new application
        cy.get('#application-subscribe').click();
        cy.get(`.MuiAutocomplete-popper li`).contains(appName).click();
        cy.get(`[data-testid="subscribe-to-api-btn"]`).click();
        cy.get(`[data-testid="subscription-table"] td`).contains(appName).should('exist');

        // Subscription blocking port in the publisher side.
        cy.logoutFromDevportal();
        cy.loginToPublisher(publisher, password);
        cy.get('#PizzaShackAPI').click();

        // wait until page load
        cy.get('[data-testid="itest-api-name-context"]', { timeout: 30000 }).should('be.visible');
        cy.url().should('contain', '/overview');
        cy.get('[data-testid="itest-api-name-context"]').contains('/pizzashack');

        // click the left menu to go to subscriptions page.
        cy.get('[data-testid="left-menu-itemsubscriptions"]').click();
        cy.get('table tr button span').contains('Block Production Only').click();
        cy.get('table tr td').contains('PROD_ONLY_BLOCKED').should('exist');
        cy.get('table tr button span').contains('Block All').click();
        cy.get('table tr td').contains('BLOCKED').should('exist');
        cy.logoutFromPublisher();
    })

    after(() => {
        cy.loginToDevportal(developer, password);
        cy.visit('/devportal/applications?tenant=carbon.super');
        cy.get(`[data-testid="delete-${appName}-btn"]`, { timeout: 30000 });
        cy.get(`[data-testid="delete-${appName}-btn"]`).click();
        cy.get(`[data-testid="application-delete-confirm-btn"]`).click();
        cy.logoutFromDevportal();
        cy.loginToPublisher(publisher, password);
        cy.deleteApi('PizzaShackAPI', '1.0.0');

        // delete users
        cy.visit('carbon/user/user-mgt.jsp');
        cy.deleteUser(developer);
        cy.deleteUser(publisher);
    })
})
