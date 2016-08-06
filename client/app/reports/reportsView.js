angular.module('GreenSaloon.reportsView', [])

.controller('reportsViewController', function ($scope, $window, $location, $routeParams, Reports, Branch, Forms, DateFormat) {
 	
	var formType = 'Daily';
	if($routeParams.RecId){
		formType = 'Recurring';
	}

 	$scope.reportDateClicked = false;

 	$scope.datepickerStart = new Date();
 	
 	$scope.datepickerEnd = new Date();

 	$scope.convertDateFormat = DateFormat.convertDateFormat;
	
	$scope.data = {};

	$scope.intialize = function(){
		Branch.getAllBranches()
		.then(function(branches){
			$scope.data.branches = branches;
		})
		.catch(function(error){
			console.log(error);
		});
	};

	$scope.getReports = function(branchId){
		if($scope.branchList){
			branchId = $scope.branchList;
		}
		Forms.getAll()
		.then(function(forms){
			var getFunc, formObject;
			// getting the id of the recurring form
			for(var i=0; i<forms.length; i++){
				if(forms[i].type === formType){
					formObject = forms[i];
					break;
				}
			}
			if(branchId){
				getFunc	= Reports.getAllByBranch.bind(this,branchId);
			} else {
				getFunc = Reports.getAll;
			}
			getFunc()
			.then(function(reports){
				$scope.data.reports = [];
				var highestMark = 0, lowestMark = 100, sumOfMarks = 0, Queryflag = false;
				// getting reports that match the query only
				for(var i=0; i<reports.length; i++){
					if(reports[i].form === formObject._id 
						&& DateFormat.compareDates($scope.datepickerStart,reports[i].date)
						&& DateFormat.compareDates(reports[i].date,$scope.datepickerEnd)
					){
						Queryflag = true;
						// getting each report mark
						var numOfTrueAnswers = 0;
						for(var j=0; j<reports[i].answer.length; j++){
							if(reports[i].answer[j].answer === 'true'){
								numOfTrueAnswers++;
							}
						}
						reports[i].numOfYes = numOfTrueAnswers;
						reports[i].numOfNo = reports[i].answer.length - numOfTrueAnswers;
						reports[i].mark = (reports[i].numOfYes/reports[i].answer.length) * 100;
						sumOfMarks += reports[i].mark;
						if(reports[i].mark > highestMark){
							highestMark	= reports[i].mark;
						}
						if(reports[i].mark < lowestMark){
							lowestMark = reports[i].mark;
						}
						$scope.data.reports.push(reports[i]);
					}
				}
				$scope.monthlyVisits = Queryflag ? $scope.data.reports.length : '-';
				$scope.avgMark = Queryflag ? sumOfMarks/$scope.monthlyVisits : '-';
				$scope.bestMark = Queryflag ? highestMark : '-';
				$scope.worstMark = Queryflag ? lowestMark : '-';
			})
			.catch(function(error){
				console.log(error);
			})
		})
		.catch(function(error){
			console.log(error);
		});
	};

	$scope.intialize();

});