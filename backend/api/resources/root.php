<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Schemas;

class Root extends Resource implements Schemas\Root {

    public function GetKeys(): array{
        return [
            'assignments',
            'groups',
            'session',
            'surveys',
            'tests',
            'users'
        ];
    }

    public function assignments(): Schemas\Collection{
        if(!$this->GetContext()->IsAuthorized()){
            throw new Exceptions\AuthorizationRequired('assignments');
        }
        $current_user = $this->GetContext()->GetUser();

        $out_assignments = [];

        $assignments = \Entities\Assignment::GetAssignmentsForUser($current_user);

        foreach($assignments as $assignment){
            $out_assignments[$assignment->GetId()] = new Assignment($assignment);
        }

        $assignments = \Entities\Assignment::GetAssignedByUser($current_user);

        foreach($assignments as $assignment){
            $out_assignments[$assignment->GetId()] = new Assignment($assignment);
        }

        $collection = new AssignmentCollection($out_assignments);
        $collection->SetContext($this->GetContext());
        return $collection;
    }

    public function groups(): Schemas\Collection{
        if(!$this->GetContext()->IsAuthorized()){
            throw new Exceptions\AuthorizationRequired('groups');
        }
        $groups = \Auth\ExternalLogin\OfficeGroup::GetAll();

        $out_groups = [];

        foreach($groups as $group){
            $out_groups[$group->GetId()] = new Group($group);
        }

        $collection = new Collection($out_groups);
        $collection->SetContext($this->GetContext());
        return $collection;
    }

    public function session(): Schemas\Session{
        $session = new Session();
        $session->SetContext($this->GetContext());
        return $session;
    }

    public function surveys(): Schemas\Collection{
        if(!$this->GetContext()->IsAuthorized()){
            throw new Exceptions\AuthorizationRequired('surveys');
        }
        $current_user = $this->GetContext()->GetUser();
        $surveys = \Entities\Test::GetSurveysCreatedByUser($current_user);

        $out_surveys = [];

        foreach($surveys as $survey){
            $out_surveys[$survey->GetId()] = new Test($survey);
        }

        $collection = new Collection($out_surveys);
        $collection->SetContext($this->GetContext());
        return $collection;
    }

    public function tests(): Schemas\Collection{
        if(!$this->GetContext()->IsAuthorized()){
            throw new Exceptions\AuthorizationRequired('tests');
        }
        $current_user = $this->GetContext()->GetUser();
        $tests = \Entities\Test::GetTestsCreatedByUser($current_user);

        $out_tests = [];

        foreach($tests as $test){
            $out_tests[$test->GetId()] = new Test($test);
        }

        $collection = new TestCollection($out_tests);
        $collection->SetContext($this->GetContext());
        return $collection;
    }

    public function users(): Schemas\Collection{
        if(!$this->GetContext()->IsAuthorized()){
            throw new Exceptions\AuthorizationRequired('users');
        }
        $current_user = $this->GetContext()->GetUser();
        $out_users = [];

        $u = new User($current_user);
        $out_users['current'] = $u;

        $all_users = \Auth\ExternalLogin\OfficeUser::GetAll();
        foreach($all_users as $user){
            $out_users[$user->GetId()] = new User($user);
        }

        $collection = new Collection($out_users);
        $collection->SetContext($this->GetContext());
        return $collection;
    }
}
?>