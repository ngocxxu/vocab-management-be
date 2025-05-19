# Deplyment by vercel
## Test locally
```
vercel dev
```

## Deploy
- But the url name will be complicated
```
vercel
```

- For the clean url name, we need to deploy on prod
```
vercel --prod
```


# Deployment by serverless
## Install serverless
```
brew install serverless
```

## Preparing your credentials
```
serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
```

## Deployment on lambda by `serverless`
```
# Run print before deploy
serverless print

# Deploy
serverless deploy --stage dev
```

## Remove all reources on aws
## Need to delete all object in S3 before run this command
```
serverless remove --stage dev
```

### To delete all object in S3
```
aws s3 rm s3://your_S3_BUCKET_NAME --recursive
```