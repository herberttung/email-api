import express from 'express'
import rp from 'request-promise'
import queryString from 'query-string'
import { getEmails, getFieldMapping, getInsight } from '../../functions/jiraAPI'

require('dotenv').config()

var router = express.Router();

router.post('/', async (req, res) => {
    res.send('done')

    try {
        const options = {
            method: 'POST',
            uri: 'http://' + process.env.LOCALHOST + ':' + process.env.PORT + '/emailapi/TOC/Assignment',
            json: true,
            body: req.body
        }
        rp(options).then(($) => {
            //res.send($)
        })
    } catch { }

    const mappedFields = await getFieldMapping(req.body.issue.fields)
    const caseNumber = req.body.issue.key
    const serviceName = req.body.issue.fields.issuetype.name
    const caseSubject = req.body.issue.fields.summary
    const assignmentGroup = mappedFields['Assignment Group'][0].match(/(.*) \([-A-Z0-9]*\)$/)[1]
    const assignee = mappedFields.Assignee[0].split(' ')[0]
    const issueLink = mappedFields['Issue Type'].self.match(/[a-z]+:\/\/[^\/]+\//)[0]
    let userProfileEmail = []
    try {
        userProfileEmail = await getEmails('TOC', 'User Profile', 'Key', mappedFields['User Information'][0].match(/(.*) \(([-A-Z0-9]*)\)$/)[2], 'Email')
    }
    catch (e) {
        console.log(e)
    }
    let serviceManager = ''
    try {
        serviceManager = mappedFields['Service Manager'].name
    } catch {}

    //console.log(mappedFields['AssignmentGroup'][0].match(/(.*) \([-A-Z0-9]*\)$/)[1])

    //Send to Email
    let to = userProfileEmail

    //let cc = await getEmails('TOC','Assignment User', 'Group', assignmentGroup, 'Email')
    //cc = cc.concat(await getEmails('TOC','Assignment User', 'Group', 'TOC', 'Email'))
    //cc.push('BILLY.KWOK@hgc.com.hk')

    let cc = 'hgctoc@hgc.com.hk'

    let bcc = []
    if (typeof caseSeverity == 'string' && (caseSeverity.search('2') >= 0 || caseSeverity.search('1') >= 0)) {
        bcc.push(serviceManager)
    }
    bcc.push('BILLY.KWOK@hgc.com.hk')
    bcc = bcc.concat(await getEmails('TOC', 'Assignment User', 'Group', 'TOC', 'Email'))

    let emailOptions = {
        method: 'POST',
        uri: 'http://' + process.env.LOCALHOST + ':' + process.env.PORT + '/emailapi/email',
        json: true,
        body: {
            from: process.env.DEFUALTSENDER,
            subject: caseNumber + " - " + caseSubject + " had been created"
        }
    }

    emailOptions.body.to = to
    emailOptions.body.cc = []
    emailOptions.body.bcc = []

    emailOptions.body.html = `Dear All</br></br>

    This is to acknowledge  the receipt of a reported case</br>
    We will have it checked and updates will be provided once available.</br></br>
    
    Reference Number : `+ caseNumber + `</br>
    Summary : ` + caseSubject + `</br>
    Service : `+ serviceName + `</br></br>
    
    Please do not hesitate to contact us at 2128 2666 or hgctoc@hgc.com.hk if any further questions or inquires regarding your ticket
    This is an auto notification sent from system, please do not reply this email.</br></br>
    
    HGC TOC`

    rp(emailOptions)

    emailOptions.body.to = cc
    emailOptions.body.cc = []
    emailOptions.body.bcc = bcc

    emailOptions.body.html = `Dear All</br></br>

    This is to acknowledge  the receipt of a reported case</br>
    We will have it checked and updates will be provided once available.</br></br>
    
    Reference Number : `+ caseNumber + `</br>
    Summary : ` + caseSubject + `</br>
    Service : `+ serviceName + `</br></br>
    
    <a href=` + process.env.URL + `/browse/` + caseNumber + `">View request</a></br></br>
    
    Please do not hesitate to contact us at 2128 2666 or hgctoc@hgc.com.hk if any further questions or inquires regarding your ticket
    This is an auto notification sent from system, please do not reply this email.</br></br>
    
    HGC TOC`

    rp(emailOptions)
})

module.exports = router;