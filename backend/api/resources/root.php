<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Schemas;

class Root extends Resource implements Schemas\Root {

    protected function LazyLoad($data, $name){
        /*$this->AddSubResource('assigned_to_me', new AssignedToMeCollection());
        $this->AddSubResource('assignments', new AssignmentCollection());
        $this->AddSubResource('groups', new GroupCollection());
        $this->AddSubResource('tests', new TestCollection());
        $this->AddSubResource('users', new UserCollection());
        return true;*/
    }

    public function GetKeys(): array{
        return [
            'assignments',
            'groups',
            'tests',
            'users'
        ];
    }

    public function assignments(): Schemas\Collection{
        $current_user = $this->GetContext()->GetUser();

        $out_assignments = [];

        $assignments = \Entities\Assignment::GetAssignmentsForUser($current_user);

        foreach($assignments as $assignment){
            $a = new Assignment($assignment);
            $a->SetContext($this->GetContext());
            $out_assignments[$assignment->GetId()] = $a;
        }

        $assignments = \Entities\Assignment::GetAssignedByUser($current_user);

        foreach($assignments as $assignment){
            $a = new Assignment($assignment);
            $a->SetContext($this->GetContext());
            $out_assignments[$assignment->GetId()] = $a;
        }

        return new Collection($out_assignments);
    }

    public function groups(): Schemas\Collection{
        $groups = \Entities\Group::GetAll();

        $out_groups = [];

        foreach($groups as $group){
            $g = new Group($group);
            $g->SetContext($this->GetContext());
            $out_groups[$group->GetId()] = $g;
        }

        return new Collection($out_groups);
    }

    public function tests(): Schemas\Collection{
        $current_user = $this->GetContext()->GetUser();
        $tests = \Entities\Test::GetTestsCreatedByUser($current_user);

        $out_tests = [];

        foreach($tests as $test){
            $t = new Test($test);
            $t->SetContext($this->GetContext());
            $out_tests[$test->GetId()] = $t;
        }

        return new Collection($out_tests);
    }

    public function users(): Schemas\Collection{
        $current_user = $this->GetContext()->GetUser();
        if($current_user->GetId() < 1){
            throw new Exceptions\ResourceInaccessible('users');
        }

        $out_users = [];

        $u = new User($current_user);
        $u->SetContext($context);
        $out_users['current'] = $u;

        $all_users = \Entities\User::GetAll();
        foreach($all_users as $user){
            $u = new User($user);
            $u->SetContext($context);
            $out_users[$user->GetId()] = $u;
        }

        return new Collection($out_users);
    }
}
?>