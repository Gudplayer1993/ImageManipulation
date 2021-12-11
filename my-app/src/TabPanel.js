import * as React from 'react';


export const TabPanel = props => {
    const { children, value, index, ...other } = props;

    return (
        <div

            role="tabpanel"
            class="tabPanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <div className="tabContentContainer">
                    {children}
                </div>
            )}
        </div>
    );
}