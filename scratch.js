const { Catch, HttpException, HttpStatus } = require('@nestjs/common');

class GlobalExceptionFilter {
	catch(exception, host) {
        console.log("Is HttpException?", exception instanceof HttpException);
        console.log("Exception class:", exception.constructor.name);
	}
}

const filter = new GlobalExceptionFilter();
const { ForbiddenException } = require('@nestjs/common');
filter.catch(new ForbiddenException(), null);
